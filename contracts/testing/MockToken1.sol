pragma solidity 0.6;
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";

contract MockToken1 is ERC20 {
    constructor() public {
        _mint(msg.sender, 1000000000000000 ether);
    }

    function burn(address holder, uint256 value) external {
        require(msg.sender == holder, "test token can only be burnt by holder");
        _burn(holder, value);
    }

    function mint(address recipient, uint256 value) external {
        _mint(recipient, value);
    }
}
