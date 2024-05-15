const { wallet, provider, ethers } = require('./libs/config');

class WalletInfo {
    getAddress() {
        return wallet.address;
    }
    async getBalance() {
        try {
            const balance = await provider.getBalance(wallet.address);
            return ethers.formatEther(balance);
        } catch (error) {
            const erroMsg = "Não foi possivel carregar o saldo."
            console.error(erroMsg, error);
            throw new Error(erroMsg);
        }
    }

    async getTransactionCount() {
        try {
            return await provider.getTransactionCount(wallet.address);
        } catch (error) {
            const erroMsg = "Não foi possível carregar o número de transações."
            console.error(erroMsg, error);
            throw new Error(erroMsg);
        }
    }

    async getCode() {
        try {
            const code = await provider.getCode(wallet.address);
            return code.substring(0, 200);
        } catch (error) {
            const erroMsg = "Não foi possível pegar o codigo do endereço"
            console.error(erroMsg, error);
            throw new Error(erroMsg);
        }
    }

    async connectWallet(ethereum) {
        if (!ethereum) {
            const erroMsg = "Nenhuma carteira encontrada!"
            console.error(erroMsg);
            throw new Error("Ethereum object not provided.");
        }
        try {
            const w3provider = new ethers.Web3Provider(ethereum);
            await w3provider.send("eth_requestAccounts", []);
            const signer = w3provider.getSigner();
            const address = await signer.getAddress();
            console.log("Conta conectada:", address);
            return `Connected: ${address}`;
        } catch (error) {
            const erroMsg = "Erro ao conectar à carteira!"
            console.error(erroMsg, error);
            alert(erroMsg + error.message);
        }
    }

};

module.exports = { WalletInfo };