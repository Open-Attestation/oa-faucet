import middy from "middy";
import { cors } from "middy/middlewares";
import { ethers, utils } from "ethers";
import { AwsKmsSigner } from "ethers-aws-kms-signer";
import { APIGatewayEvent } from "aws-lambda";
import createError from "http-errors";

import { Record, String } from "runtypes";

const KmsCredentialConfig = Record({
  accessKeyId: String.withConstraint((keyId) => keyId.length === 20 || `Provided KMS Access Key ID has invalid length`),
  secretAccessKey: String.withConstraint(
    (accessKey) => accessKey.length === 40 || `Provided KMS Secret Access Key has invalid length`
  ),
  region: String,
  keyId: String,
});

const kmsCredentials = KmsCredentialConfig.check({
  accessKeyId: process.env.KMS_ACCESS_KEY_ID,
  secretAccessKey: process.env.KMS_SECRET_ACCESS_KEY,
  region: process.env.KMS_REGION,
  keyId: process.env.KMS_KEY_ID,
});

const handleFaucet = async (event: APIGatewayEvent) => {
  try {
    const receiver = event.pathParameters?.walletAddress;

    if (receiver === undefined || !utils.isAddress(receiver)) throw createError(400, "Invalid wallet address");

    const provider = ethers.getDefaultProvider("ropsten");
    let signer = new AwsKmsSigner(kmsCredentials);
    signer = signer.connect(provider);
    const signerBalance = ethers.utils.formatEther(await signer.getBalance());
    if (parseInt(signerBalance, 10) < 1) {
      throw new Error("Oops! Faucet has ran dry, please inform the Open-Attestation team.");
    }

    const transfer = await signer.sendTransaction({
      to: receiver,
      value: utils.parseEther("1"),
    });
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: receiver,
        txhash: transfer.hash,
        amount: "1",
      }),
    };
  } catch (e) {
    return {
      statusCode: e.status || 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};

export const handler = middy(handleFaucet).use(cors());
