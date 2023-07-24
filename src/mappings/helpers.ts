/* eslint-disable prefer-const */
import { log, BigInt, BigDecimal, Address, EthereumEvent } from '@graphprotocol/graph-ts'
import { ERC20 } from '../types/Factory/ERC20'
import { ERC20SymbolBytes } from '../types/Factory/ERC20SymbolBytes'
import { ERC20NameBytes } from '../types/Factory/ERC20NameBytes'
import { User, Bundle, Token, LiquidityPosition, LiquidityPositionSnapshot, Pair } from '../types/schema'
import { Factory as FactoryContract } from '../types/templates/Pair/Factory'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0x0Dea90EC11032615E027664D2708BC292Bbd976B'

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS))

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export function bigDecimalExp18(): BigDecimal {
  return BigDecimal.fromString('1000000000000000000')
}

export function convertEthToDecimal(eth: BigInt): BigDecimal {
  return eth.toBigDecimal().div(exponentToBigDecimal(18))
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal()
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

export function equalToZero(value: BigDecimal): boolean {
  const formattedVal = parseFloat(value.toString())
  const zero = parseFloat(ZERO_BD.toString())
  if (zero == formattedVal) {
    return true
  }
  return false
}

export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  // hard coded overrides
  if (tokenAddress.toHexString() == '0xbc594cabd205bd993e7ffa6f3e9cea75c1110da5') {
    return 'USDC'
  }
  if (tokenAddress.toHexString() == '0x985458e523db3d53125813ed68c274899e9dfab4') {
    return '1USDC'
  }
  if (tokenAddress.toHexString() == '0x224e64ec1bdce3870a6a6c777edd450454068fec') {
    return '1UST'
  }
  if (tokenAddress.toHexString() == '0xef977d2f931c1978db5f6747666fa1eacb0d0339') {
    return '1DAI'
  }
  if (tokenAddress.toHexString() == '0x3095c7557bcb296ccc6e363de01b760ba031f2d9') {
    return '1BTC'
  }
  if (tokenAddress.toHexString() == '0x1d374ED0700a0aD3cd4945D66a5B1e08e5db20A8') {
    return 'bscDai'
  }
  if (tokenAddress.toHexString() == '0xd068722E4e1387E4958300D1e625d2878f784125') {
    return 'ethDai'
  }
  if (tokenAddress.toHexString() == '0x4cc435d7b9557d54d6ef02d69bbf72634905bf11') {
    return 'ETH'
  }
  if (tokenAddress.toHexString() == '0x6983d1e6def3690c4d616b13597a09e6193ea013') {
    return '1ETH'
  }
  if (tokenAddress.toHexString() == '0x118f50d23810c5e09ebffb42d7d3328dbf75c2c2') {
    return 'WBTC'
  }
  


  let contract = ERC20.bind(tokenAddress)
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress)

  // try types string and bytes32 for symbol
  let symbolValue = 'unknown'
  let symbolResult = contract.try_symbol()
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol()
    if (!symbolResultBytes.reverted) {
      // for broken pairs that have no symbol function exposed
      if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
        symbolValue = symbolResultBytes.value.toString()
      }
    }
  } else {
    symbolValue = symbolResult.value
  }

  return symbolValue
}

export function fetchTokenName(tokenAddress: Address): string {
  // hard coded overrides
  if (tokenAddress.toHexString() == '0xbc594cabd205bd993e7ffa6f3e9cea75c1110da5') {
    return 'USD Coin'
  }
  if (tokenAddress.toHexString() == '0x985458e523db3d53125813ed68c274899e9dfab4') {
    return 'USD Coin Depegged'
  }
  if (tokenAddress.toHexString() == '0x224e64ec1bdce3870a6a6c777edd450454068fec') {
    return 'USDT Depegged'
  }
  if (tokenAddress.toHexString() == '0xef977d2f931c1978db5f6747666fa1eacb0d0339') {
    return 'DAI Depegged'
  }
  if (tokenAddress.toHexString() == '0x3095c7557bcb296ccc6e363de01b760ba031f2d9') {
    return 'BTC Depegged'
  }
  if (tokenAddress.toHexString() == '0x1d374ED0700a0aD3cd4945D66a5B1e08e5db20A8') {
    return 'bscDai Token'
  }
  if (tokenAddress.toHexString() == '0xd068722E4e1387E4958300D1e625d2878f784125') {
    return 'ethDai Token'
  }
  if (tokenAddress.toHexString() == '0x4cc435d7b9557d54d6ef02d69bbf72634905bf11') {
    return 'Ethereum Token'
  }
  if (tokenAddress.toHexString() == '0x6983d1e6def3690c4d616b13597a09e6193ea013') {
    return 'Ethereum Depegged'
  }
  if (tokenAddress.toHexString() == '0x118f50d23810c5e09ebffb42d7d3328dbf75c2c2') {
    return 'Wrapped Bitcoin'
  }

  let contract = ERC20.bind(tokenAddress)
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress)

  // try types string and bytes32 for name
  let nameValue = 'unknown'
  let nameResult = contract.try_name()
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name()
    if (!nameResultBytes.reverted) {
      // for broken exchanges that have no name function exposed
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString()
      }
    }
  } else {
    nameValue = nameResult.value
  }

  return nameValue
}

export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress)
  let totalSupplyValue = null
  let totalSupplyResult = contract.try_totalSupply()
  if (!totalSupplyResult.reverted) {
    totalSupplyValue = totalSupplyResult as i32
  }
  return BigInt.fromI32(totalSupplyValue as i32)
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  // hardcode overrides
  if (tokenAddress.toHexString() == '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9') {
    return BigInt.fromI32(18)
  }

  let contract = ERC20.bind(tokenAddress)
  // try types uint8 for decimals
  let decimalValue = null
  let decimalResult = contract.try_decimals()
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value
  }
  return BigInt.fromI32(decimalValue as i32)
}

export function createLiquidityPosition(exchange: Address, user: Address): LiquidityPosition {
  let id = exchange
    .toHexString()
    .concat('-')
    .concat(user.toHexString())
  let liquidityTokenBalance = LiquidityPosition.load(id)
  if (liquidityTokenBalance === null) {
    let pair = Pair.load(exchange.toHexString())
    pair.liquidityProviderCount = pair.liquidityProviderCount.plus(ONE_BI)
    liquidityTokenBalance = new LiquidityPosition(id)
    liquidityTokenBalance.liquidityTokenBalance = ZERO_BD
    liquidityTokenBalance.pair = exchange.toHexString()
    liquidityTokenBalance.user = user.toHexString()
    liquidityTokenBalance.save()
    pair.save()
  }
  if (liquidityTokenBalance === null) log.error('LiquidityTokenBalance is null', [id])
  return liquidityTokenBalance as LiquidityPosition
}

export function createUser(address: Address): void {
  let user = User.load(address.toHexString())
  if (user === null) {
    user = new User(address.toHexString())
    user.usdSwapped = ZERO_BD
    user.save()
  }
}

export function createLiquiditySnapshot(position: LiquidityPosition, event: EthereumEvent): void {
  let timestamp = event.block.timestamp.toI32()
  let bundle = Bundle.load('1')
  let pair = Pair.load(position.pair)
  let token0 = Token.load(pair.token0)
  let token1 = Token.load(pair.token1)

  // create new snapshot
  let snapshot = new LiquidityPositionSnapshot(position.id.concat(timestamp.toString()))
  snapshot.liquidityPosition = position.id
  snapshot.timestamp = timestamp
  snapshot.block = event.block.number.toI32()
  snapshot.user = position.user
  snapshot.pair = position.pair
  snapshot.token0PriceUSD = token0.derivedETH.times(bundle.ethPrice)
  snapshot.token1PriceUSD = token1.derivedETH.times(bundle.ethPrice)
  snapshot.reserve0 = pair.reserve0
  snapshot.reserve1 = pair.reserve1
  snapshot.reserveUSD = pair.reserveUSD
  snapshot.liquidityTokenTotalSupply = pair.totalSupply
  snapshot.liquidityTokenBalance = position.liquidityTokenBalance
  snapshot.liquidityPosition = position.id
  snapshot.save()
  position.save()
}
