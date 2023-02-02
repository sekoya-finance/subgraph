import { BigInt } from '@graphprotocol/graph-ts';
import { ExecutedOrder, Vault } from '../generated/schema';
import { ExecuteDCA, TurnOff, Vault as VaultContract, Withdraw } from '../generated/templates/Vault/Vault';
import { Vault as VaultTemplate } from '../generated/templates';
import { getOrCreateToken } from './token';
import { CreateDCA } from '../generated/Factory/Factory';
import { getOrCreateFactory } from './factory';

export function createVault(event: CreateDCA): Vault {
  const vault = new Vault(event.params.newVault.toHex());
  const contract = VaultContract.bind(event.params.newVault);

  const dcaData = contract.dcaData();

  vault.factory = getOrCreateFactory().id;
  vault.owner = contract.owner();

  vault.sellToken = getOrCreateToken(contract.sellToken()).id;
  vault.sellTokenPriceFeed = dcaData.value0;

  vault.buyToken = getOrCreateToken(contract.buyToken()).id;
  vault.buyTokenPriceFeed = dcaData.value1;

  vault.amount = dcaData.value4;
  vault.nextExecutableTimestamp = BigInt.fromU32(0);
  vault.epochDuration = dcaData.value2;
  vault.creationTimestamp = event.block.timestamp;
  vault.executedOrders = [];
  vault.totalSell = BigInt.fromU32(0);
  vault.totalBuy = BigInt.fromU32(0);
  vault.active = true;

  vault.save();
  VaultTemplate.create(event.params.newVault);
  return vault;
}

function createExecutedOrder(event: ExecuteDCA, vault: Vault): void {
  let executedOrder = new ExecutedOrder(event.transaction.hash.toHex());

  executedOrder.received = event.params.received;
  executedOrder.timestamp = event.block.timestamp;
  executedOrder.vault = vault.id;
  executedOrder.executor = event.transaction.from;

  executedOrder.save();
}

export function handleExecuteDCA(event: ExecuteDCA): void {
  let vault = Vault.load(event.address.toHex());
  if (vault === null) {
    return;
  }

  vault.nextExecutableTimestamp = event.block.timestamp.plus(vault.epochDuration);
  vault.totalSell = vault.totalSell.plus(vault.amount);
  vault.totalBuy = vault.totalBuy.plus(event.params.received);

  createExecutedOrder(event, vault);

  vault.save();
}

export function handleTurnOff(event: TurnOff): void {
  let vault = Vault.load(event.address.toHex());
  if (vault === null) {
    return;
  }

  vault.active = false;
  vault.save();
}
