const { sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { getConnection } = require("../helper/solana");

async function tvl(api) {
  const connection = getConnection();
  const lookupTableAddress = new PublicKey("eP8LuPmLaF1wavSbaB4gbDAZ8vENqfWCL5KaJ2BRVyV");
 
  const lookupTableAccount = (
    await connection.getAddressLookupTable(lookupTableAddress)
  ).value;

  const tokenAccounts = [];
  for (let i = 0; i < lookupTableAccount.state.addresses.length; i++) {
    const address = lookupTableAccount.state.addresses[i];
    tokenAccounts.push(address.toBase58());
  }

  const res = await sumTokens2({
    tokenAccounts,
    balances: api.getBalances()
  });

  const resModified = {};

  for (let key in res) {
    if (key === 'solana:kyJtowDDACsJDm2jr3VZdpCA6pZcKAaNftQwrJ8KBQP' || 
      key === 'solana:WFRGJnQt5pK8Dv4cDAbrSsgPcmboysrmX3RYhmRRyTR') {
      // kyjto, wfragjto => jto
      const targetKey = 'solana:jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL';
      if (targetKey in resModified) {
          resModified[targetKey] = parseInt(resModified[targetKey], 10) + parseInt(res[key], 10);
      } else {
          resModified[targetKey] = res[key];
      }
  }  else if (key === 'solana:BenJy1n3WTx9mTjEvy63e8Q1j4RqUc6E4VBMz3ir4Wo6') {
      // usd* => usdc
      const targetKey = 'solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
      if (targetKey in resModified) {
          resModified[targetKey] = parseInt(resModified[targetKey], 10) + parseInt(res[key], 10);
      } else {
          resModified[targetKey] = res[key];
      }
    } else {
      resModified[key] = res[key];
    }
  }

  return resModified;
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated by summing the value of the traders' vault, LP vault, and earn vault.",
  solana: { tvl },
};
