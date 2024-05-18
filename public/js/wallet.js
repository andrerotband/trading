class Wallet {
  constructor () {
    this.initElements();
    this.setupListeners();
    this.setupBlockchainEvents();
    this.updateWalletInfo();
  }

  initElements() {
    const ids = [
      'loadingSpinnerWallet', 'walletAddress', 'walletBalance', 'walletTransactionCount', 'connectWallet'
    ];
    this.elements = ids.reduce((acc, id) => {
      const element = document.getElementById(id);
      if (element) {
        acc[id] = element;
      }
      return acc;
    }, {});
  }

  setupListeners() {
    if (this.elements.connectWallet) {
      this.elements.connectWallet.addEventListener('click', this.connectWallet.bind(this));
    }
  }

  setupBlockchainEvents() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => this.handleAccountsChanged(accounts));
      window.ethereum.on('chainChanged', (chainId) => this.handleChainChanged(chainId));
    }
  }

  async connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) {
          this.displayNotification("MetaMask is locked. Please unlock to continue.", "warning");
        } else {
          this.updateWalletInfo();
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        this.displayNotification("Failed to connect to MetaMask. Please ensure it is installed and unlocked.", "error");
      }
    } else {
      this.displayNotification("MetaMask is not installed!", "warning");
    }
  }

  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      console.log('Please connect to MetaMask.');
      this.displayNotification("MetaMask is locked or the user has not connected any accounts.", "warning");
    } else {
      this.updateWalletInfo();
    }
  }

  handleChainChanged(chainId) {
    console.log('Connected to a new chain:', chainId);
    this.updateWalletInfo();
  }

  displayNotification(message, type) {
    const notificationElement = document.createElement("div");
    notificationElement.className = `notification ${type}`;
    notificationElement.textContent = message;
    document.body.appendChild(notificationElement);
    setTimeout(() => document.body.removeChild(notificationElement), 3000);
  }

  async updateWalletInfo() {
    this.showLoading(true);
    try {
      const response = await fetch('/wallet');
      if (!response.ok) {
        throw new Error("Failed to fetch wallet information.");
      }
      const data = await response.json();
      if (this.elements.walletAddress) this.elements.walletAddress.value = data.address;
      if (this.elements.walletBalance) this.elements.walletBalance.value = data.balance;
      if (this.elements.walletTransactionCount) this.elements.walletTransactionCount.value = data.transactionCount;
    } catch (error) {
      console.error('Failed to update wallet info:', error);
      this.displayNotification("Error retrieving wallet information. Please try again later.", "error");
    } finally {
      this.showLoading(false);
    }
  }

  showLoading(isLoading) {
    this.elements.loadingSpinnerWallet.classList.toggle('d-none', !isLoading);
  }
}