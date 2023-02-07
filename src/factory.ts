import { CreateDCA } from '../generated/Factory/Factory';
import { Factory } from '../generated/schema';
import { FACTORY } from './constants';
import { createVault } from './vault';

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
