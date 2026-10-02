import { Hono } from 'hono';
import { db } from '../db';
import { stepImages } from '../db/schema/stepImages';
import { procedureSteps } from '../db/schema/procedureSteps';
import { eq } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/response';
import { uploadFile, getFileStream, deleteFile, BUCKET_NAME } from '../services/minio';

const filesRouter = new Hono();

// GET /api/files/steps/:imageId (Stream image directly from MinIO - Public/Auth with Cache)
filesRouter.get('/steps/:imageId', async (c) => {
  const imageId = parseInt(c.req.param('imageId'));
  const image = await db.query.stepImages.findFirst({
    where: eq(stepImages.id, imageId),
  });

  if (!image) return errorResponse(c, 'ไม่พบรูปภาพที่ระบุ', 404);

  try {
    const stream = await getFileStream(image.objectKey);
    // Determine content type from original filename
    let contentType = 'image/jpeg';
    if (image.originalFilename.endsWith('.png')) contentType = 'image/png';
    else if (image.originalFilename.endsWith('.webp')) contentType = 'image/webp';
    else if (image.originalFilename.endsWith('.gif')) contentType = 'image/gif';

    return new Response(stream as any, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache 1 day
      },
    });
  } catch (err: any) {
    return errorResponse(c, 'ไม่สามารถดึงรูปภาพจากพื้นที่จัดเก็บได้', 500, err.message);
  }
});

// All mutating routes require auth
filesRouter.use('*', requireAuth);

// POST /api/files/steps/:stepId/images (Upload image to MinIO) - Both Admin & User
filesRouter.post('/steps/:stepId/images', async (c) => {
  const stepId = parseInt(c.req.param('stepId'));

  const step = await db.query.procedureSteps.findFirst({
    where: eq(procedureSteps.id, stepId),
  });
  if (!step) return errorResponse(c, 'ไม่พบขั้นตอนที่ต้องการแนบรูป', 404);

  const body = await c.req.parseBody();
  const file = body['file'];
  const caption = (body['caption'] as string) || '';

  if (!file || typeof file === 'string') {
    return errorResponse(c, 'กรุณาเลือกไฟล์รูปภาพที่ต้องการอัปโหลด', 400);
  }

  const uploadedFile = file as File;
  const originalFilename = uploadedFile.name;
  const ext = originalFilename.split('.').pop() || 'jpg';
  const objectKey = `steps/${stepId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

  const arrayBuffer = await uploadedFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    await uploadFile(objectKey, buffer, {
      'content-type': uploadedFile.type,
      'original-name': encodeURIComponent(originalFilename),
    });

    const [savedImage] = await db.insert(stepImages).values({
      stepId,
      bucketName: BUCKET_NAME,
      objectKey,
      originalFilename,
      caption,
    }).returning();

    return successResponse(c, savedImage, 'อัปโหลดรูปภาพสำเร็จ', 201);
  } catch (err: any) {
    return errorResponse(c, 'เกิดข้อผิดพลาดในการบันทึกรูปภาพลง MinIO', 500, err.message);
  }
});

// PUT /api/files/images/:id (Update image caption or sortOrder)
filesRouter.put('/images/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();

  const image = await db.query.stepImages.findFirst({
    where: eq(stepImages.id, id),
  });
  if (!image) return errorResponse(c, 'ไม่พบรูปภาพที่ต้องการแก้ไข', 404);

  const [updated] = await db.update(stepImages).set({
    ...(body.caption !== undefined ? { caption: body.caption } : {}),
    ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
  }).where(eq(stepImages.id, id)).returning();

  return successResponse(c, updated, 'แก้ไขข้อมูลรูปภาพสำเร็จ');
});

// DELETE /api/files/images/:id (ADMIN ONLY)
filesRouter.delete('/images/:id', requireAdmin, async (c) => {
  const id = parseInt(c.req.param('id'));

  const image = await db.query.stepImages.findFirst({
    where: eq(stepImages.id, id),
  });
  if (!image) return errorResponse(c, 'ไม่พบรูปภาพที่ต้องการลบ', 404);

  try {
    await deleteFile(image.objectKey);
  } catch (err) {
    console.error('Failed to remove object from MinIO:', err);
  }

  await db.delete(stepImages).where(eq(stepImages.id, id));
  return successResponse(c, { id }, 'ลบรูปภาพสำเร็จ');
});

export default filesRouter;
