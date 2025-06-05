const Tweep = require('../models/tweep.model.js');
const { Account, RpcProvider, Contract, cairo, CallData } = require("starknet");

const provider = new RpcProvider({ nodeUrl: process.env.PROVIDER });
const account = new Account(
    provider,
    process.env.ACCT_ADDRESS,
    process.env.PRIVATE_KEY
);

exports.getFreeTokens = async (req, res) => {
    try {
        const { email, argentAdress } = req.query;
        const TOKEN_CONTRACT = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
        const AMOUNT = cairo.uint256(200000000000);

        if (!email || !argentAdress) {
            return res.status(400).json({ message: "Email and Argent address are required." });
        }

        const tweep = await Tweep.findOne({ email });
        if (tweep) {
            return res.status(400).json({ message: "You have already claimed your free tokens." });
        }

        // Check balance
        const tokenContract = new Contract(
            // You need to provide the ABI for the token contract here
            require('../abi/token.json'),
            TOKEN_CONTRACT,
            provider
        );
        const balanceResult = await tokenContract.balanceOf(account.address);
        const balance = balanceResult.balance; // Should be a Cairo uint256 object

        // Convert balance to BigInt for comparison
        const balanceBigInt = BigInt(balance.low) + (BigInt(balance.high) << 128);
        const amountBigInt = BigInt(AMOUNT.low) + (BigInt(AMOUNT.high) << 128);

        if (balanceBigInt < amountBigInt) {
            return res.status(400).json({ message: "Faucet has insufficient balance." });
        }

        // Save the claim
        const newTweep = new Tweep({ email, argentAdress, hasagreedToTerms: true });
        await newTweep.save();

        // Transfer tokens
        const transfer = await account.execute({
            contractAddress: TOKEN_CONTRACT,
            entrypoint: "transfer",
            calldata: CallData.compile({
                address: argentAdress,
                amount: AMOUNT,
            }),
        });

        console.log('Transfer sent:', transfer);

        return res.status(200).json({ message: "Free tokens claimed successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while claiming free tokens.", error });
    }
}