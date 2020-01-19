pragma solidity ^0.6.1;
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Validator.sol";
import "../contractFacades/PyroTokenLike.sol";
import "../contractFacades/ERC20Like.sol";
/*
	A bellow is the reserve of a Pyrotoken. It contains the base token. 
	When a bellow is added to, it is 'opened'. When a pyrotoken is redeemed, the bellow 'blasts'.
	The Bellows contract uses a mapping to hold reserves for all pyrotokens.
	The Bellows maintain the redeem rate.
 */
contract Bellows is Secondary {
	using SafeMath for uint;
	Validator validator;
	address public donationAddress;
	function setValidator(address v) public onlyPrimary {
		validator = Validator(v);
	}

	function setDonationAddress (address d) public onlyPrimary (){
		donationAddress = d;
	}

	function blast(address pyroToken, uint value) public {
		require(validator.tokens(pyroToken),"token not a valid pyrotoken");
		require(ERC20Like(pyroToken).transferFrom(msg.sender,address(this),value),"Transfer from holder failed");
		require(PyroTokenLike(pyroToken).burn(value),"could not burn pyrotoken");
		require(PyroTokenLike(pyroToken).bellows() == address(this),"pyroToken reserve mismatch");
		uint redeemRate = getRedeemRate(pyroToken);
		uint baseTokenPayable = value.mul(redeemRate).div(10000);
		address baseTokenAddress = PyroTokenLike(pyroToken).baseToken();
		require(ERC20Like(baseTokenAddress).transfer(msg.sender,baseTokenPayable),"unable to pay base token from reserve");
	}

	function getRedeemRate(address pyroToken) public view returns (uint) {//pyroPerMyriadToken
		uint pyroTotalSupply = ERC20Like(pyroToken).totalSupply();
		uint baseTotalSupply = ERC20Like(PyroTokenLike(pyroToken).baseToken()).totalSupply();

		if(pyroTotalSupply == 0)
			return 100;

		return baseTotalSupply
		.mul(10000) //scale by a myriad
		.div(pyroTotalSupply);
	}

	function withdrawDonations(address token) public {
		uint balance = ERC20Like(token).balanceOf(address(this));
		ERC20Like(token).transfer(donationAddress,balance);
	}
}
