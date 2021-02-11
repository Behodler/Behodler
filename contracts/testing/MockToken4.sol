pragma solidity 0.6;
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";

contract MockToken4 is ERC20 {
    constructor() public {
        _mint(msg.sender, 1000000000 ether);
    }

    uint8 public decimals = 8;

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
