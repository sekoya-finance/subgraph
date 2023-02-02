import { CreateDCA } from '../generated/Factory/Factory';
import { Factory } from '../generated/schema';
import { createVault } from './vault';

const FACTORY = '0xE832e7b348215A87507b1EaF0ea4c2EFb29dDe00';

export function getOrCreateFactory(): Factory {
  let factory = Factory.load(FACTORY);

  if (factory === null) {
    factory = new Factory(FACTORY);
    factory.save();
  }
  return factory;
}

export function handleCreateDCA(event: CreateDCA): void {
  createVault(event);
}
