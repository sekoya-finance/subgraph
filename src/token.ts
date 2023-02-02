import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Token } from '../generated/schema';
import { ERC20 } from '../generated/templates/Token/ERC20';

export function getOrCreateToken(address: Address): Token {
  let token = Token.load(address.toHex());

  if (token === null) {
    token = new Token(address.toHex());
    const erc20 = ERC20.bind(address);
    token.decimals = BigInt.fromI32(erc20.decimals());
    token.symbol = erc20.symbol();
    token.save();
  }
  return token;
}
