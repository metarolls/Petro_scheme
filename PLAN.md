# Auth Migration Plan

## Phase 2: Auth Migration (Ralph Loop) [DONE]

### Goals
- Transition from mock login/bypass to real Firebase Phone Authentication.
- Secure Firestore collections using robust security rules.
- Implement role-based access control (RBAC) in `AuthContext`.

### Tasks

#### 1. Security Rules Implementation [DONE]
- [x] Create `firestore.rules` with initial structure.
- [x] Refine rules to support "check if registered" logic by moving check to post-login.
- [x] Add rules for `wallet_history` with sourceId/destinationId validation and exists() checks.
- [x] Grant admin full read/write access and fix helper function evaluation.

#### 2. Login Page Refactoring [DONE]
- [x] **DealerLogin.tsx**: Implemented post-login registration check and feedback.
- [x] **ContractorLogin.tsx**: Implemented post-login registration check and feedback.
- [x] **MerchantLogin.tsx**: Fixed duplication and implemented post-login registration check.
- [x] **Admin Login (Login.tsx)**: Updated to use `useAuth` and handled role-based redirection.
- [x] **Dev Bypass Removal**: Removed development bypass buttons for production readiness.

#### 3. AuthContext Refinement [DONE]
- [x] Ensure `onAuthStateChanged` correctly fetches profiles and roles.
- [x] Handle "Registered but role not assigned" edge cases (Sign out if no role found).

#### 4. Verification [IN PROGRESS]
- [/] Test login flow for each role (Manual verification required).
- [ ] Verify security rules using Firestore emulator or manual testing.

## Phase 3: Final Polish & Audit
- [ ] Audit all sensitive Firestore operations for rule compliance.
- [ ] Implement detailed error logging for auth failures.
- [ ] Optimize profile fetching in `AuthContext` (e.g. use Promise.all for role checks).

## Phase 4: 4-Step Wallet Flow Implementation [IN PROGRESS]

### Goals
- Implement strict 4-step logic: Admin -> Dealer -> Contractor -> Petrol Pump -> Admin.
- Automated reward calculations based on weight (₹0.20/kg).
- Secure and auditable wallet transactions using Firestore transactions.

### Tasks

#### 1. Database Schema Refinement [DONE]
- [x] Add `walletBalance` to `dealers`, `contractors`, and `merchant`.
- [x] Ensure `role` field is correctly set for all users.
- [x] Create `contractors` collection (distinct from `dealers` for cleaner management).

#### 2. Step 1: Admin to Dealer (Allocation) [DONE]
- [x] Update `DealerManagement.tsx` to calculate reward (Weight MT * 1000 * 0.2).
- [x] Update `handleAllocateStock` to atomicaly update `stockMT` and `walletBalance`.
- [x] Log allocation in `wallet_history`.

#### 3. Step 2: Dealer to Contractor (Transfer) [IN PROGRESS]
- [x] Update `DealerTransfer.tsx` to search for `contractors` instead of `merchant`.
- [x] Implement weight-based reward transfer (Weight kg * 0.2).
- [/] Deduct from Dealer's wallet/stock, add to Contractor's wallet.

#### 4. Step 3: Contractor to Petrol Pump (Payment)
- [ ] Update `FuelPayment.tsx` to ensure it deducts from `contractors` collection.
- [ ] Implement direct currency transfer (₹).
- [ ] Deduct from Contractor's wallet, add to Pump's wallet.

#### 5. Step 4: Petrol Pump to Admin (Settlement)
- [ ] Update `Settlements.tsx` (Admin) to handle wallet settlements.
- [ ] Update `merchant/Settlement.tsx` to show pending wallet balance and request payout.

#### 6. Security Rules & Audit
- [ ] Update `firestore.rules` to allow Dealers to update Contractor balances and vice-versa.
- [ ] Validate transaction types and roles in rules.

## Decisions Made
- **Reward Rate**: Fixed at ₹0.20/kg for all transactions.
- **Coupon Logic**: Deprecated in favor of direct wallet-to-wallet weight-based transfers.
