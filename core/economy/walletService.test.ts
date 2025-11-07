import { describe, it, expect } from 'vitest';
import { WalletService } from './walletService';

describe('WalletService', () => {
  it('should create a valid wallet', () => {
    const wallet = WalletService.createWallet('zxdid:zentix:0xTEST123');

    expect(wallet.balance).toBe(0);
    expect(wallet.currency).toBe('ZXT');
    expect(WalletService.isValidAddress(wallet.address)).toBe(true);
    expect(wallet.agent_did).toBe('zxdid:zentix:0xTEST123');
  });

  it('should deposit funds correctly', () => {
    let wallet = WalletService.createWallet();
    wallet = WalletService.deposit(wallet, 100, 'Initial deposit');

    expect(wallet.balance).toBe(100);
    expect(wallet.transactions.length).toBe(1);
    expect(wallet.transactions[0].type).toBe('income');
  });

  it('should spend funds correctly', () => {
    let wallet = WalletService.createWallet();
    wallet = WalletService.deposit(wallet, 100);
    wallet = WalletService.spend(wallet, 30, 'Purchase');

    expect(wallet.balance).toBe(70);
    expect(wallet.transactions.length).toBe(2);
  });

  it('should throw error on insufficient funds', () => {
    const wallet = WalletService.createWallet();

    expect(() => WalletService.spend(wallet, 100)).toThrow('Insufficient funds');
  });

  it('should transfer between wallets', () => {
    let wallet1 = WalletService.createWallet();
    const wallet2 = WalletService.createWallet();

    wallet1 = WalletService.deposit(wallet1, 100);

    const [sender, receiver] = WalletService.transfer(wallet1, wallet2, 30);

    expect(sender.balance).toBe(70);
    expect(receiver.balance).toBe(30);
    expect(sender.transactions.length).toBe(2);
    expect(receiver.transactions.length).toBe(1);
  });

  it('should reward correctly', () => {
    let wallet = WalletService.createWallet();
    wallet = WalletService.reward(wallet, 50, 'Task completed', {
      task_id: 'task123',
    });

    expect(wallet.balance).toBe(50);
    expect(wallet.transactions[0].type).toBe('reward');
    expect(wallet.transactions[0].metadata?.task_id).toBe('task123');
  });

  it('should get wallet summary', () => {
    let wallet = WalletService.createWallet();
    wallet = WalletService.deposit(wallet, 100);
    wallet = WalletService.spend(wallet, 20);
    wallet = WalletService.reward(wallet, 30, 'Bonus');

    const summary = WalletService.getSummary(wallet);

    expect(summary.balance).toBe(110);
    expect(summary.total_transactions).toBe(3);
    expect(summary.total_income).toBe(100);
    expect(summary.total_expense).toBe(20);
    expect(summary.total_rewards).toBe(30);
  });

  it('should validate wallet addresses', () => {
    expect(WalletService.isValidAddress('ztw:0x8AFCE1B0921A9E91FFFFFFFFFFFFF01A')).toBe(
      true
    );
    expect(WalletService.isValidAddress('invalid-address')).toBe(false);
    expect(WalletService.isValidAddress('ztw:0xTOOSHORT')).toBe(false);
  });

  it('should export and import wallet', () => {
    const original = WalletService.createWallet();
    const exported = WalletService.export(original);
    const imported = WalletService.import(exported);

    expect(imported.address).toBe(original.address);
    expect(imported.balance).toBe(original.balance);
  });
});
