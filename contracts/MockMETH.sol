// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockMETH is ERC20 {
    constructor() ERC20("Mantle Staked ETH", "mETH") {
        _mint(msg.sender, 1000000 * 10**18); // Te damos 1 millón iniciales
    }

    function faucet() external {
        _mint(msg.sender, 10 * 10**18); // Cualquiera puede pedir 10 mETH
    }
}
