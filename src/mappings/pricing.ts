/* eslint-disable prefer-const */
import { Pair, Token, Bundle } from '../types/schema'
import { BigDecimal, Address, BigInt } from '@graphprotocol/graph-ts/index'
import { ZERO_BD, factoryContract, ADDRESS_ZERO, ONE_BD } from './helpers'

const WETH_ADDRESS = '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a'
const PIT_ADDRESS = '0xf4e99513b2d31ae0b9080ff18d480ea9ed03084a'

const USDC_WETH_PAIR = '0x135812fe9df18b70978eb05958ff9dc74a196083' // old usdc
const DAI_WETH_PAIR = '0x1f2c0d293cc9cea24d4e882d0bf60a469e36ad39' // new usdc

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let daiPair = Pair.load(DAI_WETH_PAIR) // dai is token0
  let usdcPair = Pair.load(USDC_WETH_PAIR) // usdc is token0

  if (daiPair !== null) {
    return daiPair.token0Price
  }
  // all 3 have been created
  else if (usdcPair !== null && daiPair === null) {
    return usdcPair.token0Price
  } else {
    return ZERO_BD
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a', // WETH
  '0xBC594CABd205bD993e7FfA6F3e9ceA75c1110da5', // USDC
  '0x9De4d1267a1075E994ddc8d6bC31b9056B9b4133', // rONE
  '0x22D62b19b7039333ad773b7185BB61294F3AdC19', // stONE
  '0xc30a7f9c216b945ff8acfb389e955a637eb0f478', //E
  '0xEa589E93Ff18b1a1F1e9BaC7EF3E86Ab62addc79', //viper
  '0x4cC435d7b9557d54d6EF02d69Bbf72634905Bf11', //old-eth
  '0x783EE3E955832a3D52CA4050c4C251731c156020', //old-eth
  '0x218532a12a389a4a92fC0C5Fb22901D1c19198aA', //old-eth
  '0x984b969a8E82F5cE1121CeB03f96fF5bB3f71FEe', //fuzz
  '0x301259f392B551CA8c592C9f676FCD2f9A0A84C5', //Matic
  '0x4cC435d7b9557d54d6EF02d69Bbf72634905Bf11', //link
  '0xE064a68994e9380250CfEE3E8C0e2AC5C0924548',
  '0x118f50d23810c5E09Ebffb42d7D3328dbF75C2c2', // btc
  '0x3095c7557bCb296ccc6e363DE01b760bA031F2d9', // dep-btc
  '0xd6bAd903e550822d51073AFb79581BF5aAE9243F', // atom
  '0xDC60CcF6Ae05f898F4255EF580E731b4011100Ec', // bnb
  '0x1e05C8B69e4128949FcEf16811a819eF2f55D33E', // sonic
  '0xFeee03BFBAA49dc8d11DDAab8592546018dfb709', // ethbridge-busd
  '0x1Aa1F7815103c0700b98f24138581b88d4cf9769', // bscbridged-busd
  '0x72Cb10C6bfA5624dD07Ef608027E366bd690048F', // Jewel
  '0xCf1709Ad76A79d5a60210F23e81cE2460542A836', // Tranq
  '0xEa589E93Ff18b1a1F1e9BaC7EF3E86Ab62addc79', // Viper
  '0xF2732e8048f1a411C63e2df51d08f4f52E598005', // USDT
  '0x9A89d0e1b051640C6704Dde4dF881f73ADFEf39a', // bscUSDT
  '0x582617bD8Ca80d22D4432E63Fda52D74dcDCEe4c', // bscADA
  '0xBC594CABd205bD993e7FfA6F3e9ceA75c1110da5', // ETH-USDC
  '0x44cED87b9F1492Bf2DCf5c16004832569f7f6cBa', // bsc-USDC
  '0x44cED87b9F1492Bf2DCf5c16004832569f7f6cBa', // eth-DAI
  '0x1d374ED0700a0aD3cd4945D66a5B1e08e5db20A8', // bsc-DAI
  '0xAE0609A062a4eAED49dE28C5f6A193261E0150eA', // aag
  '0x2DA729BA5231d2C79290aBA4a8b85a5c94dA4724', // arb-usdt
  '0x7C07d01C9DaB5aBB09CE2b42242a7570F25fC2CC', // arb-dai
  '0x9b5fae311A4A4b9d838f301C9c27b55d19BAa4Fb', // arb-usdc
  '0x90D81749da8867962c760414C1C25ec926E889b6' //uni
]

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps

// minimum liquidity for price to get tracked
let MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('0')

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == WETH_ADDRESS) {
    return ONE_BD
  }
  if (token.id == PIT_ADDRESS) {
    return ZERO_BD
  }
  // loop through whitelist and check if paired with any
  for (let i = 0; i < WHITELIST.length; ++i) {
    let pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(WHITELIST[i]))
    if (pairAddress.toHexString() != ADDRESS_ZERO) {
      let pair = Pair.load(pairAddress.toHexString())
      if (pair.token0 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token1 = Token.load(pair.token1)
        return pair.token1Price.times(token1.derivedETH as BigDecimal) // return token1 per our token * Eth per token 1
      }
      if (pair.token1 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token0 = Token.load(pair.token0)
        return pair.token0Price.times(token0.derivedETH as BigDecimal) // return token0 per our token * ETH per token 0
      }
    }
  }
  return ZERO_BD // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getTrackedVolumeUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token,
  blockn: BigInt
): BigDecimal {
  let bundle = Bundle.load('1')
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0
      .times(price0)
      .plus(tokenAmount1.times(price1))
      .div(BigDecimal.fromString('2'))
  }

  // take full value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0)
  }

  // take full value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1)
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedLiquidityUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let bundle = Bundle.load('1')
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1))
  }

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString('2'))
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString('2'))
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}
