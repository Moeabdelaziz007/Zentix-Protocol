# 🌌 Zentix Protocol - Manus Completion Package

هذا المجلد يحتوي على الملفات الناقصة التي تحتاج إكمالها عبر **Manus AI**.

---

## 📂 محتويات المجلد

```
zentix-manus/
├── server/
│   ├── guardianAPI.ts           # ✅ موجود - ناقص 3 methods
│   ├── governanceDaemon.ts      # ✅ موجود
│   └── cron/
│       ├── dailyAudit.ts        # ⚠️ هيكل فارغ - يحتاج إكمال
│       └── distributeRewards.ts # ⚠️ هيكل فارغ - يحتاج إكمال
├── core/
│   ├── relayer/
│   │   └── relayerService.ts    # ✅ موجود - ناقص integration
│   ├── security/
│   │   ├── guardianAgent.ts     # ✅ موجود - ناقص methods
│   │   └── policyEngine.ts      # ✅ موجود
│   └── db/
│       └── supabaseClient.ts    # ⚠️ هيكل فارغ - يحتاج إكمال
├── package.json                 # ✅ جاهز
└── tsconfig.json                # ✅ جاهز
```

---

## 🎯 المهام المطلوبة من Manus

### 1️⃣ Guardian API (server/guardianAPI.ts)

**Methods ناقصة:**

```typescript
// في GuardianAgent class
static getAllGuardians(): Guardian[]
static getAllReports(): GuardianReport[]

// في PolicyEngine class
static exportAudit(did: string): AuditExport
```

**المطلوب:**
- إضافة هذه الـ methods في الملفات المناسبة
- التأكد من return types صحيحة
- Integration مع Supabase للحصول على البيانات

---

### 2️⃣ Relayer Service (core/relayer/relayerService.ts)

**المشكلة الحالية:**
- Missing ethers.js integration
- No actual blockchain transaction sending

**المطلوب:**
- Fix ethers.js imports
- Implement actual gasless transaction relay
- Add nonce management from blockchain
- Test with Mumbai testnet

---

### 3️⃣ Cron Jobs

#### A. Daily Audit (server/cron/dailyAudit.ts)

**المطلوب:**
```typescript
async function runDailyAudit(): Promise<AuditResult> {
  // 1. Fetch all agents from Supabase
  // 2. Run PolicyEngine.checkCompliance() on each
  // 3. Aggregate statistics
  // 4. Save audit records to database
  // 5. Send notifications if critical issues
}
```

#### B. Distribute Rewards (server/cron/distributeRewards.ts)

**المطلوب:**
```typescript
async function distributeWeeklyRewards(): Promise<RewardDistribution> {
  // 1. Get active guardians from last 7 days
  // 2. Calculate contribution scores
  // 3. Call GuardianRewards smart contract
  // 4. Update Supabase with payment records
  // 5. Send reward notifications
}
```

---

### 4️⃣ Supabase Client (core/db/supabaseClient.ts)

**Schema موجود، المطلوب:**
- Implement all CRUD methods
- Add proper error handling
- Add query optimization
- Test with actual Supabase instance

**Tables:**
- agents
- guardians
- violations
- audits
- rewards
- transactions

---

## 🚀 كيفية استخدام Manus

### الخطوة 1: رفع المجلد
```bash
# Compress the folder
cd "/Users/cryptojoker710/Desktop/Zentix Protocol"
zip -r zentix-manus.zip zentix-manus/
```

### الخطوة 2: Prompt لـ Manus

```
أنت مطور TypeScript خبير. لديك مشروع Zentix Protocol ناقص بعض الأجزاء.

المطلوب:
1. إكمال Guardian API: أضف getAllGuardians(), getAllReports(), exportAudit()
2. إصلاح Relayer Service: أضف ethers.js integration وتنفيذ gasless transactions
3. إكمال Cron Jobs: 
   - dailyAudit.ts: audit جميع الـ agents وحفظ النتائج
   - distributeRewards.ts: توزيع rewards على guardians
4. إكمال Supabase Client: implement جميع الـ CRUD operations

الشروط:
- TypeScript strict mode
- كل function يجب أن يكون async/await
- Error handling شامل
- Comments واضحة بالإنجليزية
- لا تغير الـ interfaces الموجودة
```

### الخطوة 3: بعد التوليد

```bash
# Download the generated files from Manus
# Extract to local project
cd "/Users/cryptojoker710/Desktop/Zentix Protocol"
cp -r zentix-manus/server/* server/
cp -r zentix-manus/core/* core/

# Test
npm run type-check
npm run build
npm run governance:daily-audit
npm run governance:distribute-rewards
```

---

## 📊 التقدم المتوقع

| Component | Status Before | Status After Manus |
|-----------|---------------|-------------------|
| Guardian API | ⚠️ 70% | ✅ 100% |
| Relayer | ⚠️ 60% | ✅ 100% |
| Cron Jobs | ❌ 0% | ✅ 100% |
| Supabase | ❌ 0% | ✅ 100% |
| **Overall** | **⚠️ 6.5/10** | **✅ 9/10** |

---

## ⚙️ Environment Variables Required

Create `.env` in Manus:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Blockchain
RPC_MUMBAI=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY_DEV=your-private-key
RELAYER_PRIVATE_KEY=your-relayer-key

# Smart Contracts
GUARDIAN_REWARDS_ADDRESS=0x...
```

---

## 🎉 Expected Output

After Manus completes the code:

✅ All TypeScript files compile without errors  
✅ Guardian API has all 9 endpoints working  
✅ Relayer can send gasless transactions  
✅ Cron jobs run successfully  
✅ Supabase integration works  
✅ Ready for deployment to Vercel + Manus Cloud  

---

**Created:** November 6, 2025  
**For:** Manus AI Code Generation  
**Project:** Zentix Protocol v0.6
