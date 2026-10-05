import { db } from './index';
import { users } from './schema/users';
import { ports } from './schema/ports';
import { agents } from './schema/agents';
import { categories } from './schema/categories';
import { governmentAgencies } from './schema/governmentAgencies';
import { workTypes } from './schema/workTypes';
import { procedures } from './schema/procedures';
import { procedureVariants } from './schema/procedureVariants';
import { procedureSteps } from './schema/procedureSteps';
import { responsibleRoles } from './schema/responsibleRoles';
import { procedureAgents } from './schema/procedureAgents';
import { eq, and, isNull } from 'drizzle-orm';

export async function runSeed() {
  console.log('🌱 Starting Database Seeding for Asiathai Freight SOP...');

  // 1. Seed Users (admin & kan)
  const defaultPassword = await Bun.password.hash('123456');

  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.username, 'admin'),
  });

  if (!existingAdmin) {
    await db.insert(users).values([
      {
        username: 'admin',
        passwordHash: defaultPassword,
        displayName: 'สมเกียรติ สุวรรณสิทธิ์',
        fullName: 'สมเกียรติ สุวรรณสิทธิ์ (Admin)',
        role: 'admin',
        isActive: true,
      },
      {
        username: 'kan',
        passwordHash: defaultPassword,
        displayName: 'กานต์ ประดิษฐ์วงษ์',
        fullName: 'กานต์ ประดิษฐ์วงษ์ (Kan)',
        role: 'user',
        isActive: true,
      },
    ]);
    console.log('✅ Users seeded: admin (role: admin), kan (role: user)');
  } else {
    console.log('ℹ️ Users already exist, skipping user seed.');
  }

  // 2. Seed Categories (5 Main Categories)
  const categoryList = [
    { code: 'TERMINAL_SHIPPING', name: 'งานหน้าท่าและสายเรือ', icon: '🚢', color: 'blue', sortOrder: 1 },
    { code: 'CUSTOMS', name: 'พิธีการศุลกากร', icon: '🏛️', color: 'volcano', sortOrder: 2 },
    { code: 'PERMITS_CERTS', name: 'ใบอนุญาตและใบรับรอง', icon: '📜', color: 'green', sortOrder: 3 },
    { code: 'INSPECTION', name: 'งานตรวจสินค้าหน้างาน', icon: '🔍', color: 'orange', sortOrder: 4 },
    { code: 'INTERNAL_OPS', name: 'ระเบียบปฏิบัติภายใน', icon: '📋', color: 'purple', sortOrder: 5 },
  ];

  for (const cat of categoryList) {
    const exists = await db.query.categories.findFirst({
      where: eq(categories.code, cat.code),
    });
    if (!exists) {
      await db.insert(categories).values(cat);
    }
  }
  console.log(`✅ 5 Categories verified/seeded.`);

  // 3. Seed Government Agencies (7 Agencies)
  const agencyList = [
    { code: 'CUSTOMS_DEPT', name: 'กรมศุลกากร', shortName: 'ศุลกากร', website: 'https://www.customs.go.th', contactInfo: 'Call Center 1164' },
    { code: 'DFT', name: 'กรมการค้าต่างประเทศ กระทรวงพาณิชย์', shortName: 'กค.ต่างประเทศ', website: 'https://www.dft.go.th', contactInfo: 'สายด่วน 1385' },
    { code: 'DOA', name: 'กรมวิชาการเกษตร (ด่านตรวจพืช)', shortName: 'ด่านพืช', website: 'https://www.doa.go.th', contactInfo: 'โทร 0-2579-0151-8' },
    { code: 'ACFS', name: 'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ (มกอช.)', shortName: 'มกอช.', website: 'https://www.acfs.go.th', contactInfo: 'โทร 0-2561-2277' },
    { code: 'FDA', name: 'สำนักงานคณะกรรมการอาหารและยา (อย.)', shortName: 'อย.', website: 'https://www.fda.moph.go.th', contactInfo: 'สายด่วน อย. 1556' },
    { code: 'DLD', name: 'กรมปศุสัตว์ (ด่านกักกันสัตว์)', shortName: 'ด่านสัตว์', website: 'https://dld.go.th', contactInfo: 'โทร 0-2653-4444' },
    { code: 'DOF', name: 'กรมประมง (ด่านตรวจสัตว์น้ำ)', shortName: 'ด่านประมง', website: 'https://www.fisheries.go.th', contactInfo: 'โทร 0-2562-0600-15' },
  ];

  for (const ag of agencyList) {
    const exists = await db.query.governmentAgencies.findFirst({
      where: eq(governmentAgencies.code, ag.code),
    });
    if (!exists) {
      await db.insert(governmentAgencies).values(ag);
    }
  }
  console.log(`✅ 7 Government Agencies verified/seeded.`);

  // 4. Seed 20 Agents
  const agentList = [
    { code: 'WHL', name: 'WAN HAI LINES (THAILAND) LTD.' },
    { code: 'YML', name: 'YANG MING LINE (THAILAND) CO., LTD.' },
    { code: 'EMC', name: 'EVERGREEN SHIPPING AGENCY (THAILAND) CO.,LTD.' },
    { code: 'CUL', name: 'COSCO SHIPPING LINES (THAILAND) CO.,LTD.' },
    { code: 'HEUNG-A', name: 'HEUNG-A SHIPPING (THAILAND) CO.,LTD.' },
    { code: 'IAL', name: 'INTERASIA LINES (THAILAND) CO.,LTD.' },
    { code: 'KMTC', name: 'KMTC (THAILAND) CO.,LTD.' },
    { code: 'MELL', name: 'MELL SHIPPING (THAILAND) CO., LTD.' },
    { code: 'ONE', name: 'OCEAN NETWORK EXPRESS (THAILAND) LTD' },
    { code: 'OOCL', name: 'OOCL (THAILAND) LTD.' },
    { code: 'PIL', name: 'EASTERN MARITIME (THAILAND) LTD.' },
    { code: 'SKR', name: 'SINOKOR MERCHANT MARINE (THAILAND) CO.,LTD.' },
    { code: 'SITC', name: 'SITC CONTAINER LINES (THAILAND) CO.,LTD.' },
    { code: 'TSL', name: 'TS CONTAINER LINES (THAILAND ) CO., LTD.' },
    { code: 'ZIM', name: 'ZIM (THAILAND) COMPANY LIMITED' },
    { code: 'MAERSK', name: 'MAERSK LINE THAILAND LTD.' },
    { code: 'CMA', name: 'CMA CGM (THAILAND) LIMITED.' },
    { code: 'MOL', name: 'MOL LOGISTICS (THAILAND) CO., LTD.' },
    { code: 'SM LINE', name: 'SM LINES AGENCY (THAILAND) CO.,LTD.' },
    { code: 'RCL', name: 'RCL FEEDER PTE LTD. C/O NGOW HOCK CO.,LTD.' },
  ];

  for (const ag of agentList) {
    const exists = await db.query.agents.findFirst({
      where: eq(agents.code, ag.code),
    });
    if (!exists) {
      await db.insert(agents).values(ag);
    }
  }
  console.log(`✅ 20 Agents verified/seeded.`);

  // 5. Seed 12 Ports
  const portList = [
    { code: 'A2', name: 'ท่าเรือ A2', paymentMethod: 'ออนไลน์', operatingHours: '24 ชม.', notes: 'รอดราฟ ช้า' },
    { code: 'A3', name: 'ท่าเรือ A3', paymentMethod: 'ออนไลน์', operatingHours: '24 ชม.', notes: 'รอดราฟ ช้า' },
    { code: 'C1C2', name: 'ท่าเรือ C1C2', paymentMethod: 'ออนไลน์', operatingHours: '24 ชม.', notes: 'รอดราฟ ช้า' },
    { code: 'D1', name: 'ท่าเรือ D1', paymentMethod: 'ออนไลน์', operatingHours: '24 ชม.', notes: 'รอดราฟ ช้า' },
    { code: 'A0', name: 'ท่าเรือ A0', paymentMethod: 'ออนไลน์', operatingHours: 'จันทร์-เสาร์ 08:00-22:00 / อาทิตย์ 08:00-20:00', notes: '' },
    { code: 'B1', name: 'ท่าเรือ B1', paymentMethod: 'ออนไลน์', operatingHours: 'จันทร์-เสาร์ 08:00-22:00 / อาทิตย์ 08:00-20:00', notes: '' },
    { code: 'B2', name: 'ท่าเรือ B2', paymentMethod: 'หน้าเคาน์เตอร์เท่านั้น', operatingHours: 'ตลอดวัน (มีช่วงพักเคาน์เตอร์)', notes: 'เคาน์เตอร์ปิด 2 ช่วง เวลา 19:30-20:10 / 23:00-24:00' },
    { code: 'B3', name: 'ท่าเรือ B3', paymentMethod: 'ออนไลน์', operatingHours: '08:00-19:30', notes: '' },
    { code: 'B4', name: 'ท่าเรือ B4', paymentMethod: 'ออนไลน์', operatingHours: '24 ชม.', notes: '' },
    { code: 'B5C3', name: 'ท่าเรือ B5C3', paymentMethod: 'ออนไลน์', operatingHours: 'จันทร์-เสาร์ 24 ชม. / อาทิตย์ 08:30-16:30', notes: '' },
    { code: 'KERRY', name: 'ท่าเรือ KERRY', paymentMethod: 'ออนไลน์', operatingHours: '24 ชม.', notes: '' },
    { code: 'SIAM COM', name: 'ท่าเรือ SIAM COM', paymentMethod: 'ออนไลน์', operatingHours: '24 ชม.', notes: '' },
  ];

  for (const pt of portList) {
    const exists = await db.query.ports.findFirst({
      where: eq(ports.code, pt.code),
    });
    if (!exists) {
      await db.insert(ports).values(pt);
    }
  }
  console.log(`✅ 12 Ports verified/seeded.`);

  // 6. Seed Work Types (Extended for Multi-Domain)
  const workTypeList = [
    { code: 'SHORE_PAY', name: 'จ่ายชอร์' },
    { code: 'DEPOSIT_RETURN', name: 'วางบิล/มัดจำตู้' },
    { code: 'FORM_E', name: 'ขอหนังสือรับรองถิ่นกำเนิดสินค้า (Form E / CO)' },
    { code: 'PHYTO_CERT', name: 'ขอใบรับรองสุขอนามัยพืช (Phyto Certificate)' },
    { code: 'PHYTO_INSPECT', name: 'แจ้งนัดตรวจสินค้าทำไฟโต / รมยา' },
    { code: 'EXPORT_DEC', name: 'จัดทำใบขนสินค้าขาออก' },
    { code: 'IMPORT_DEC', name: 'จัดทำใบขนสินค้าขาเข้า' },
    { code: 'ACFS_CERT', name: 'ขอมกอช. / ขึ้นทะเบียน มกษ.' },
    { code: 'CUSTOMS_INSPECT', name: 'เปิดตรวจศุลกากร / X-Ray' },
    { code: 'DO_EXCHANGE', name: 'แลกใบปล่อยสินค้า (D/O)' },
  ];

  for (const wt of workTypeList) {
    const exists = await db.query.workTypes.findFirst({
      where: eq(workTypes.code, wt.code),
    });
    if (!exists) {
      await db.insert(workTypes).values(wt);
    }
  }
  console.log(`✅ Work Types verified/seeded.`);

  // 7. Seed Responsible Roles (Master Data)
  const defaultRolesList = [
    { code: 'SHIPPING_STAFF', name: 'พนักงานหน้างาน / ชิปปิ้ง', color: 'blue', icon: '👤', description: 'พนักงานหน้างาน หรือชิปปิ้งผู้ดำเนินการยื่นเรื่องและส่งเอกสาร', sortOrder: 1 },
    { code: 'PORT_OFFICER', name: 'เจ้าหน้าที่ท่าเรือ', color: 'volcano', icon: '🏢', description: 'เจ้าหน้าที่ประจำท่าเรือหรือเทอร์มินัล ตรวจสอบและลงตรา', sortOrder: 2 },
    { code: 'AGENT_OFFICER', name: 'เจ้าหน้าที่สายเรือ / เอเย่นต์', color: 'cyan', icon: '🚢', description: 'เจ้าหน้าที่ตัวแทนสายเรือหรือเอเย่นต์ ตรวจสอบ B/L และอนุมัติ', sortOrder: 3 },
    { code: 'FINANCE_STAFF', name: 'พนักงานออฟฟิศ / การเงิน', color: 'purple', icon: '💼', description: 'ฝ่ายบัญชี/การเงิน ดำเนินการออกใบเสร็จหรือตัดยอดบัญชี', sortOrder: 4 },
    { code: 'DRIVER', name: 'คนขับรถ / ขนส่ง', color: 'gold', icon: '🚚', description: 'พนักงานขับรถหัวลากหรือรถบรรทุกรับ-ส่งตู้คอนเทนเนอร์', sortOrder: 5 },
    { code: 'CUSTOMS', name: 'เจ้าหน้าที่ศุลกากร', color: 'magenta', icon: '🏛️', description: 'เจ้าหน้าที่ด่านศุลกากร ตรวจปล่อยสินค้าและรับรองเอกสาร', sortOrder: 6 },
    { code: 'GOV_OFFICER', name: 'เจ้าหน้าที่หน่วยงานราชการ', color: 'geekblue', icon: '📜', description: 'เจ้าหน้าที่ด่านตรวจพืช ด่านสัตว์ อย. หรือกรมการค้าต่างประเทศ', sortOrder: 7 },
  ];

  for (const r of defaultRolesList) {
    const exists = await db.query.responsibleRoles.findFirst({
      where: eq(responsibleRoles.code, r.code),
    });
    if (!exists) {
      await db.insert(responsibleRoles).values(r);
    }
  }
  console.log(`✅ Responsible Roles verified/seeded.`);

  // 8. Backfill Category for Existing Procedures (if null)
  const terminalCategory = await db.query.categories.findFirst({
    where: eq(categories.code, 'TERMINAL_SHIPPING'),
  });

  if (terminalCategory) {
    await db.update(procedures)
      .set({ categoryId: terminalCategory.id })
      .where(isNull(procedures.categoryId));
    console.log(`✅ Existing procedures backfilled to Category 'TERMINAL_SHIPPING'.`);
  }

  // 9. Seed Example Procedure (C1C2 + WHL + จ่ายชอร์) if not exists
  const portC1C2 = await db.query.ports.findFirst({ where: eq(ports.code, 'C1C2') });
  const agentWHL = await db.query.agents.findFirst({ where: eq(agents.code, 'WHL') });
  const typeShore = await db.query.workTypes.findFirst({ where: eq(workTypes.code, 'SHORE_PAY') });

  if (portC1C2 && agentWHL && typeShore && terminalCategory) {
    const existingProc = await db.query.procedures.findFirst({
      where: and(
        eq(procedures.portId, portC1C2.id),
        eq(procedures.agentId, agentWHL.id),
        eq(procedures.workTypeId, typeShore.id)
      ),
    });

    if (!existingProc) {
      const [newProc] = await db.insert(procedures).values({
        categoryId: terminalCategory.id,
        portId: portC1C2.id,
        agentId: agentWHL.id,
        workTypeId: typeShore.id,
        title: 'ขั้นตอนการจ่ายชอร์ C1C2 ของสายเรือ WHL',
        description: 'แนวทางปฏิบัติงานในการชำระค่าธรรมเนียมชอร์ท่า C1C2 สำหรับตู้สินค้าสายเรือ Wan Hai Lines',
        referenceDocuments: 'B/L, Booking Confirmation, ใบเสร็จชำระเงิน',
        contactHotline: '038-400-000',
        updatedBy: 'สมเกียรติ สุวรรณสิทธิ์ (Admin)',
      }).returning();
      const targetProcId = newProc.id;

      // Link procedure with WHL, YML, EMC
      const agentYML = await db.query.agents.findFirst({ where: eq(agents.code, 'YML') });
      const agentEMC = await db.query.agents.findFirst({ where: eq(agents.code, 'EMC') });
      for (const ag of [agentWHL, agentYML, agentEMC].filter(Boolean)) {
        await db.insert(procedureAgents).values({
          procedureId: targetProcId,
          agentId: ag!.id,
        });
      }

      // Variant 1: ปกติ
      const [var1] = await db.insert(procedureVariants).values({
        procedureId: targetProcId,
        conditionName: 'กรณีปกติ (ชำระผ่านระบบ e-Portal)',
        executionMethod: 'Web Portal',
        cutoffTime: 'ก่อน 15:30 น.',
        notes: 'กรุณาตรวจสอบยอดเงินและรอดราฟใบเสร็จก่อนตัดจ่ายทุกครั้ง',
        sortOrder: 1,
      }).returning();

      await db.insert(procedureSteps).values([
        {
          variantId: var1.id,
          stepNumber: 1,
          title: 'เข้าสู่ระบบ e-Portal ของท่าเรือ C1C2',
          description: 'ล็อกอินเข้าสู่ระบบด้วย User รหัสผ่านประจำบริษัท และเลือกเมนู e-Payment',
          responsibleRole: 'พนักงานหน้างาน / ชิปปิ้ง',
          sortOrder: 1,
        },
        {
          variantId: var1.id,
          stepNumber: 2,
          title: 'ระบุเลข Booking / B/L และตรวจสอบยอดเงิน',
          description: 'กรอกเลขตู้หรือ B/L ของสายเรือ WHL ตรวจสอบว่าตรงกับเอกสารปล่อยตู้',
          responsibleRole: 'พนักงานหน้างาน / ชิปปิ้ง',
          sortOrder: 2,
        },
        {
          variantId: var1.id,
          stepNumber: 3,
          title: 'ชำระเงินและดาวน์โหลดใบเสร็จรับเงิน',
          description: 'ชำระผ่าน QR Payment หรือโอนเงิน จากนั้นดาวน์โหลด e-Receipt เพื่อใช้ปล่อยตู้',
          responsibleRole: 'พนักงานออฟฟิศ / การเงิน',
          sortOrder: 3,
        },
      ]);

      // Variant 2: ฉุกเฉิน
      const [var2] = await db.insert(procedureVariants).values({
        procedureId: targetProcId,
        conditionName: 'กรณีระบบขัดข้อง (ชำระฉุกเฉิน)',
        executionMethod: 'ส่งเอกสารผ่าน LINE Official',
        cutoffTime: 'ก่อน 16:00 น.',
        notes: 'ต้องโทรยืนยันกับเจ้าหน้าที่การเงินหลังส่งไลน์ทุกครั้ง โทร 038-xxx-xxx',
        sortOrder: 2,
      }).returning();

      await db.insert(procedureSteps).values([
        {
          variantId: var2.id,
          stepNumber: 1,
          title: 'ส่งเอกสาร B/L และใบแจ้งหนี้เข้า LINE Official',
          description: 'ส่งเอกสารเข้า LINE @c1c2helpdesk พร้อมแจ้งชื่อสายเรือ WHL',
          responsibleRole: 'พนักงานหน้างาน / ชิปปิ้ง',
          sortOrder: 1,
        },
        {
          variantId: var2.id,
          stepNumber: 2,
          title: 'โอนเงินตามบัญชีท่าเรือและส่งสลิป',
          description: 'โอนเงินเข้าบัญชีธนาคารกรุงไทย และแนบหลักฐานสลิปโอนเงิน',
          responsibleRole: 'พนักงานออฟฟิศ / การเงิน',
          sortOrder: 2,
        },
      ]);

      console.log('✅ Example procedure seeded (C1C2 + WHL) with 2 variants and 5 steps.');
    } else {
      console.log('ℹ️ Example procedure already exists, keeping variants and steps intact.');
    }
  }

  console.log('🎉 Seeding successfully completed for Asiathai Freight SOP!');
}

if (import.meta.main) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
