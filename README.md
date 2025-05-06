# Luckcky Sui

## Introduction

Decentralized lottery platform, all data is stored in **Sui**, private data is encrypted using **Seal**, and the **Passkey Wallet** provides a new Web3 experience, of course, **Walrus** is also very important, as it stores image resources and even websites.

## What problem was solved?

- **Credibility:** Everyone can check the results on **Sui**. The code is fully open source and anyone can review it.
- **Sensitive data:** With **Seal**, no one except the pool administrator can view the information you provide.
- **Conditions of use:** No wallet plug-in is required, and no Web3 experience is required. **Passkey** combined with Sui's high performance provides a website experience that is infinitely close to Web2.
- **Storage:** The resources and even the website itself have been taken over by **Walrus**, which is simple, cheap, safe and practical...
- **Management mechanism:** Any lottery application needs to be reviewed by the administrator, and the prize draw requires confirmation from more than half of the administrators. Any incorrect operation or even cheating can be traced back to an individual.
- **Minimum number of transactions:** With the help of **PTB**, batch approval/rejection of applications and batch modification of data can be completed in one transaction.

## Future

- Improve and add new features, and use the minimum entry requirements brought by **Passkey Wallet** to attract more and more people to contact **Web3** and **Move**, and strengthen the development of **Sui** ecology.
- There is no need to pay any fees except transaction fees now, and there will be no payment restrictions on the contract in the future. However, when using the front-end integrated functions, an additional 0.1% fee may be charged to maintain project development.

## Usage

### Online

[Walrus](https://luckcky-sui.wal.app)(If it has not expired)

[Vercel](https://luckcky-sui.vercel.app)

### Local

```bash
# git clone ...
touch .env
# add the following two lines to the newly created `.env` file
# NEXT_PUBLIC_NETWORK=testnet
# NEXT_PUBLIC_AGGREGATOR=https://mainnet-aggregator.hoh.zone/v1/blobs
bun install
bun run dev
# the above two commands can be replaced with your favorite package management tool
```

