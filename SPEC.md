# Metaroll Rewards - Functional Specification

## Overview
Metaroll Rewards is a wallet-based loyalty and payment system for the TMT stock distribution network. The system tracks rewards based on stock weight and facilitates payments for fuel at partner petrol pumps.

## 4-Step Business Logic Flow

### Step 1: Admin to Dealer (Allocation)
- **Actor**: Admin
- **Action**: Admin allocates TMT stock (in MT) to a Dealer.
- **Calculation**: 
  - 1 MT = 1000 kg.
  - Reward = Weight (kg) * ₹0.20.
  - Example: 10 MT = 10,000 kg * ₹0.20 = ₹2,000.
- **Database**:
  - `dealers/{dealerId}.walletBalance` increases by reward amount.
  - `dealers/{dealerId}.stockMT` increases by allocated weight.
  - `wallet_history` log created (Type: `allocation`).

### Step 2: Dealer to Contractor (Sales)
- **Actor**: Dealer
- **Action**: Dealer sells TMT stock to a Contractor and transfers reward.
- **Input**: Weight (kg).
- **Calculation**: 
  - Reward = Weight (kg) * ₹0.20.
  - Example: 5,000 kg * ₹0.20 = ₹1,000.
- **Database**:
  - `dealers/{dealerId}.walletBalance` decreases by reward amount.
  - `contractors/{contractorId}.walletBalance` increases by reward amount.
  - `wallet_history` log created (Type: `transfer`, Source: Dealer, Destination: Contractor).

### Step 3: Contractor to Petrol Pump (Payment)
- **Actor**: Contractor
- **Action**: Contractor pays for fuel at a Petrol Pump using wallet balance.
- **Input**: Amount (₹).
- **Database**:
  - `contractors/{contractorId}.walletBalance` decreases by amount.
  - `merchant/{pumpId}.walletBalance` increases by amount.
  - `wallet_history` log created (Type: `payment`, Source: Contractor, Destination: Petrol Pump).

### Step 4: Petrol Pump to Admin (Settlement)
- **Actor**: Petrol Pump (Merchant) & Admin
- **Action**: Petrol Pump requests settlement. Admin approves and pays.
- **Database**:
  - `merchant/{pumpId}.walletBalance` resets to 0 (or decreases by settled amount).
  - `settlements` log created.
  - `wallet_history` log created (Type: `settlement`).

## Data Model

### `dealers`
- `firmName`: string
- `mobileNumber`: string (unique)
- `walletBalance`: number
- `stockMT`: number
- `role`: 'dealer'

### `contractors`
- `name`: string
- `mobileNumber`: string (unique)
- `walletBalance`: number
- `role`: 'contractor'

### `merchant`
- `name`: string
- `mobileNumber`: string (unique)
- `walletBalance`: number
- `role`: 'merchant'

### `wallet_history`
- `sourceId`: string
- `destinationId`: string
- `amount`: number
- `type`: 'allocation' | 'transfer' | 'payment' | 'settlement'
- `status`: 'completed' | 'pending'
- `timestamp`: serverTimestamp
