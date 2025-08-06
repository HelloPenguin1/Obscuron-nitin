# 🔐 Encrypted GitHub Bounty Dispenser

This project is built as part of the **Arcium Fellowship**, with the goal of creating a privacy-preserving bounty distribution system for open-source contributions using **Arcium's gMPC stack** and **Solana**.

Maintainers can securely score pull requests and compute contributor rewards based on encrypted inputs—ensuring fairness and transparency without revealing sensitive scoring data.

---

## 🌐 Live Preview

> ⚠️ Not deployed yet — running locally for PoC  

---

## ⚙️ Features

- ✅ GitHub Login via OAuth
- ✅ Fetches all PRs from selected repo
- ✅ Maintainer inputs encrypted **effort**, **quality**, and **length** scores
- ✅ Encrypted computation using **Arcium MXE**
- ✅ Solana wrapper program to queue computation and handle callback
- 🔐 Zero-knowledge bounty calculation (secure via gMPC)

---

## 🏗️ Architecture

![Architecture Diagram](./assets/architecture.png)

---

## 💡 Technologies Used

- Frontend: React, TailwindCSS, Framer Motion
- Backend: Node.js, Express, GitHub OAuth
- Blockchain: Solana (Anchor), Arcium gMPC (MXE, encrypted-ixs, wrapper program)

---

