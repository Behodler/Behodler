pragma solidity  0.5;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "./baseContracts/IValidator.sol";
//TODO import version controller solidity

contract Behodler is Secondary
{
	address versionControllerAddress;
	address validatorAddress;
	
	function setVersionController(address vcAddress) public onlyPrimary{
		versionControllerAddress = vcAddress;
	}

	function setValidatorAddress(address valAddress) public onlyPrimary {
		validatorAddress = valAddress;
	}
}