import { db } from './index';
import { jobWorkflows, jobWorkflowSteps, jobWorkflowDependencies } from './schema';
import { eq } from 'drizzle-orm';

export async function seedWorkflows() {
  console.log('🌱 Seeding sample Job Workflows...');

  const samples = [
    {
      id: 1,
      code: 'WF-IMP-FOOD',
      title: 'สายงานการผ่านพิธีการนำเข้าสินค้าอาหารและพืชแปรรูป (NSW & อย.)',
      description: 'ขั้นตอนตั้งแต่การยื่นใบอนุญาต อย. (LPI), ตรวจสอบพิกัด, จัดทำใบขนสินค้าขาเข้า และชำระภาษีตรวจปล่อย',
      categoryId: 2,
      status: 'active' as const,
      estimatedDuration: '1-2 วันทำการ',
      targetAudience: 'พนักงานชิปปิ้ง / ผู้ประสานงานนำเข้า',
      createdBy: 'Admin',
      steps: [
        {
          id: 1,
          title: 'ยื่นขอใบอนุญาตนำเข้า อย. ผ่านระบบ NSW (LPI)',
          briefDescription: 'ยื่นพิกัดและส่วนผสมสินค้าอาหารเพื่อรับรหัส LPI',
          procedureId: null,
          governmentAgencyId: 5, // FDA
          portId: null,
          sortOrder: 1,
          stepType: 'standard',
          outputs: ['เลขที่ใบอนุญาต LPI 13 หลัก'],
        },
        {
          id: 2,
          title: 'ขอหนังสือรับรองถิ่นกำเนิดสินค้า Form E',
          briefDescription: 'ใช้สิทธิพิเศษทางภาษีตามความตกลงการค้าเสรีอาเซียน-จีน',
          procedureId: 57, // Form E SOP
          governmentAgencyId: 2, // DFT
          portId: null,
          sortOrder: 2,
          stepType: 'standard',
          outputs: ['ต้นฉบับ Form E'],
        },
        {
          id: 3,
          title: 'จัดทำใบขนสินค้าขาเข้าและส่งข้อมูล EDI ศุลกากร',
          briefDescription: 'นำเลข LPI และ Form E ไปกรอกในระบบใบขนสินค้าขาเข้าเพื่อตัดสิทธิ์',
          procedureId: null,
          governmentAgencyId: 1, // Customs
          portId: null,
          sortOrder: 3,
          stepType: 'standard',
          outputs: ['เลขที่ใบขนสินค้าขาเข้า 14 หลัก'],
          dependsOnStepIndices: [0, 1],
        },
        {
          id: 4,
          title: 'ชำระค่าธรรมเนียมท่าเรือ จ่ายชอร์ และตรวจปล่อยสินค้า',
          briefDescription: 'ชำระค่าภาระ C1C2 และนำตู้สินค้าออกจากท่าเรือ',
          procedureId: 1, // WHL Shore SOP
          governmentAgencyId: 1,
          portId: 3, // C1C2
          sortOrder: 4,
          stepType: 'standard',
          outputs: ['ใบเสร็จรับเงิน C1C2', 'ใบปล่อยสินค้า Gate Pass'],
          dependsOnStepIndices: [2],
        },
      ],
    },
    {
      id: 2,
      code: 'WF-EXP-FRUIT',
      title: 'สายงานการส่งออกผลไม้สดไปประเทศจีน (Form E & ไฟโต พก.5)',
      description: 'กระบวนการขอใบรับรองสุขอนามัยพืช (Phyto) นัดรมยา ขอ Form E หอการค้า และเปิดตรวจตู้สินค้า',
      categoryId: 3,
      status: 'active' as const,
      estimatedDuration: '2-3 วันทำการ',
      targetAudience: 'เจ้าหน้าที่เอกสารส่งออก / ชิปปิ้งหน้าด่าน',
      createdBy: 'Admin',
      steps: [
        {
          id: 5,
          title: 'ขอใบรับรองสุขอนามัยพืช (Phyto Certificate พก.5)',
          briefDescription: 'ยื่นระบบด่านตรวจพืชและนัดหมายเจ้าหน้าที่สุ่มตรวจโรคพืช',
          procedureId: null,
          governmentAgencyId: 3, // DOA
          portId: null,
          sortOrder: 1,
          stepType: 'standard',
          outputs: ['ใบรับรองไฟโต พก.5 ตัวจริง'],
        },
        {
          id: 6,
          title: 'จัดทำและยื่นใบรับรองถิ่นกำเนิดสินค้า Form E กรมการค้าต่างประเทศ',
          briefDescription: 'ยื่นระบบ DFT เพื่อขอสิทธิลดหย่อนภาษีศุลกากรปลายทางจีน',
          procedureId: 57,
          governmentAgencyId: 2,
          portId: null,
          sortOrder: 2,
          stepType: 'standard',
          outputs: ['Form E ฉบับจริงตราประทับ'],
        },
        {
          id: 7,
          title: 'ส่งข้อมูลใบขนสินค้าขาออกและเปิดตู้โหลดลงเรือ',
          briefDescription: 'ส่งข้อมูล EDI เข้ากรมศุลกากรและปิดตู้เข้าลานคอนเทนเนอร์',
          procedureId: null,
          governmentAgencyId: 1,
          portId: 3,
          sortOrder: 3,
          stepType: 'standard',
          outputs: ['ใบกำกับการขนย้ายสินค้า'],
          dependsOnStepIndices: [0, 1],
        },
      ],
    },
    {
      id: 3,
      code: 'WF-SHORE-PAY',
      title: 'สายงานการจัดการค่าภาระหน้าท่าและแลกใบปล่อยสินค้า (D/O & จ่ายชอร์)',
      description: 'ขั้นตอนการชำระเงินค่าธรรมเนียมหน้าท่า วางบิลมัดจำตู้ และแลก D/O กับสายเรือเพื่อนำตู้สินค้าออก',
      categoryId: 1,
      status: 'active' as const,
      estimatedDuration: '3-5 ชั่วโมง',
      targetAudience: 'พนักงานหน้าท่า / ฝ่ายการเงิน',
      createdBy: 'Admin',
      steps: [
        {
          id: 8,
          title: 'แลกใบสั่งปล่อยสินค้า (D/O) กับสายเรือ',
          briefDescription: 'ยื่นเอกสาร B/L ฉบับสลักหลัง พร้อมหลักฐานชำระค่าระวางเพื่อรับ D/O',
          procedureId: null,
          governmentAgencyId: null,
          portId: null,
          sortOrder: 1,
          stepType: 'standard',
          outputs: ['ใบสั่งปล่อยสินค้า D/O'],
        },
        {
          id: 9,
          title: 'จ่ายชอร์และชำระค่าภาระหน้าท่า e-Portal',
          briefDescription: 'เข้าระบบท่าเรือ C1C2 ตัดยอดชำระเงินค่าลิฟต์ตู้และค่าธรรมเนียม',
          procedureId: 1,
          governmentAgencyId: null,
          portId: 3,
          sortOrder: 2,
          stepType: 'standard',
          outputs: ['ใบเสร็จรับเงินค่าภาระท่าเรือ'],
          dependsOnStepIndices: [0],
        },
      ],
    },
    {
      id: 4,
      code: 'WF-CUST-INSPECT',
      title: 'สายงานการเปิดตรวจศุลกากรและเอกซเรย์ตู้สินค้า (Red Line Inspection)',
      description: 'กระบวนการลากตู้เข้าจุด X-Ray ประสานงานนายตรวจศุลกากร และตัดบัญชีเปิดตรวจปล่อยหน้าด่านท่าเรือ',
      categoryId: 4,
      status: 'active' as const,
      estimatedDuration: '1 วันทำการ',
      targetAudience: 'พนักงานหน้าด่าน / ชิปปิ้งหน้างาน',
      createdBy: 'Admin',
      steps: [
        {
          id: 10,
          title: 'ลากตู้สินค้าเข้าศูนย์เอกซเรย์ศุลกากร (X-Ray Center)',
          briefDescription: 'แจ้งทะเบียนหัวลากและลากตู้ผ่านอุโมงค์เอกซเรย์ตรวจสอบภาพสแกน',
          procedureId: null,
          governmentAgencyId: 1,
          portId: 3,
          sortOrder: 1,
          stepType: 'standard',
          outputs: ['ผลวิเคราะห์ภาพสแกน X-Ray'],
        },
        {
          id: 11,
          title: 'เปิดตู้ร่วมกับนายตรวจศุลกากรและตัดบัญชีส่งมอบ',
          briefDescription: 'ตัดซีลตู้ ตรวจนับชนิดและปริมาณสินค้าเทียบใบขนสินค้าและปล่อยสินค้า',
          procedureId: null,
          governmentAgencyId: 1,
          portId: 3,
          sortOrder: 2,
          stepType: 'standard',
          outputs: ['บันทึกผลการเปิดตรวจศุลกากร'],
          dependsOnStepIndices: [0],
        },
      ],
    },
  ];

  for (const wf of samples) {
    const existing = await db.query.jobWorkflows.findFirst({
      where: eq(jobWorkflows.code, wf.code),
    });

    let workflowId = existing?.id;
    if (!existing) {
      const [inserted] = await db.insert(jobWorkflows).values({
        code: wf.code,
        title: wf.title,
        description: wf.description,
        categoryId: wf.categoryId,
        status: wf.status,
        estimatedDuration: wf.estimatedDuration,
        targetAudience: wf.targetAudience,
        createdBy: wf.createdBy,
      }).returning();
      workflowId = inserted.id;
    }

    if (workflowId) {
      // Check if steps already exist
      const existingSteps = await db.query.jobWorkflowSteps.findMany({
        where: eq(jobWorkflowSteps.workflowId, workflowId),
      });

      if (existingSteps.length === 0) {
        const stepIds: number[] = [];
        for (const s of wf.steps) {
          const [step] = await db.insert(jobWorkflowSteps).values({
            workflowId,
            title: s.title,
            briefDescription: s.briefDescription,
            procedureId: s.procedureId,
            governmentAgencyId: s.governmentAgencyId,
            portId: s.portId,
            sortOrder: s.sortOrder,
            stepType: s.stepType,
            outputs: s.outputs,
          }).returning();
          stepIds.push(step.id);
        }

        // Add dependencies
        for (let i = 0; i < wf.steps; i++) {
          const s = wf.steps[i];
          if (s.dependsOnStepIndices) {
            for (const depIdx of s.dependsOnStepIndices) {
              const currentStepId = stepIds[i];
              const prereqStepId = stepIds[depIdx];
              if (currentStepId && prereqStepId) {
                await db.insert(jobWorkflowDependencies).values({
                  workflowId,
                  stepId: currentStepId,
                  dependsOnStepId: prereqStepId,
                });
              }
            }
          }
        }
      }
    }
  }

  console.log('✅ Job Workflows seeded successfully.');
}

if (import.meta.main) {
  seedWorkflows().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
