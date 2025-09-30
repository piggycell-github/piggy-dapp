pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

abstract contract BEP20TokenOwner is Ownable {
    constructor() Ownable(_msgSender()) {}

    function getOwner() external view returns (address) {
        return owner();
    }
}

abstract contract ERC20Decimals is ERC20 {
    uint8 private immutable _decimals;

    constructor(uint8 decimals_) {
        _decimals = decimals_;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}

abstract contract ERC20Detailed is ERC20Decimals {
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) ERC20(name_, symbol_) ERC20Decimals(decimals_) {}
}

contract PiggyWatt is ERC20Detailed, BEP20TokenOwner {

    mapping(address => bool) public authorizedUsers;
    
    event MintWithMemo(address indexed to, uint256 amount, string memo);
    event BurnWithMemo(address indexed from, uint256 amount, string memo);
    event AuthorizedUserAdded(address indexed user);
    event AuthorizedUserRemoved(address indexed user);
    
    modifier onlyAuthorized() {
        require(authorizedUsers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor()
        ERC20Detailed("PiggyWatt", "PGW", 0)
    {
    }

    function addAuthorizedUser(address user) external onlyOwner {
        require(user != address(0), "Cannot add zero address");
        require(!authorizedUsers[user], "User already authorized");
        authorizedUsers[user] = true;
        emit AuthorizedUserAdded(user);
    }

    function removeAuthorizedUser(address user) external onlyOwner {
        require(authorizedUsers[user], "User not authorized");
        authorizedUsers[user] = false;
        emit AuthorizedUserRemoved(user);
    }

    function isAuthorized(address user) external view returns (bool) {
        return authorizedUsers[user] || user == owner();
    }

    function mint(address to, uint256 amount, string memory memo) external onlyAuthorized {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than zero");
        _mint(to, amount);
        emit MintWithMemo(to, amount, memo);
    }

    function burn(address from, uint256 amount, string memory memo) external onlyAuthorized {
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(balanceOf(from) >= amount, "Insufficient balance");
        _burn(from, amount);
        emit BurnWithMemo(from, amount, memo);
    }

    function transfer(address to, uint256 amount) public virtual override onlyAuthorized returns (bool) {
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override onlyAuthorized returns (bool) {
        return super.transferFrom(from, to, amount);
    }
}