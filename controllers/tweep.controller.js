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

        if (!email || !argentAdress) {
            return res.status(400).json({ message: "Email and Argent address are required." });
        }

        const tweep = await Tweep.findOne({ email });

        if (tweep) {
            return res.status(400).json({ message: "You have already claimed your free tokens." });
        }

        const newTweep = new Tweep({ email, argentAdress, hasagreedToTerms: true });
        await newTweep.save();

        // Here you can add logic to transfer tokens to the argentAdress
        // For example, using the account.execute method
        account.execute({
            contractAddress: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
            entrypoint: "transfer",
            calldata: CallData.compile({
                address: argentAdress,
                amount: cairo.uint256(200000000000), // Adjust the amount as needed
            }),
        }).then((transfer) => {
            console.log('Transfer sent:', transfer);
        }).catch((error) => {
            console.error('Error sending transfer:', error);
        });

        return res.status(200).json({ message: "Free tokens claimed successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while claiming free tokens.", error });
    }
}  
