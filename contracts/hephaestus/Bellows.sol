pragma solidity ^0.6.1;
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Lachesis.sol";
import "./PyroTokenRegistry.sol";
import "../contractFacades/PyroTokenLike.sol";
import "../contractFacades/ERC20Like.sol";
/*
	A bellow is the reserve of a Pyrotoken. It contains the base token.
	When a bellow is added to, it is 'opened'. When a pyrotoken is redeemed, the bellow 'blasts'.
	The Bellows contract uses a mapping to hold reserves for all pyrotokens.
	The Bellows maintain the redeem rate for each token.
 */
contract Bellows is Secondary {
	using SafeMath for uint;
	Lachesis lachesis;
	PyroTokenRegistry registry;

	function seed(address lachesisAddress, address pyroTokenRegistry) external onlyPrimary {
		lachesis = Lachesis(lachesisAddress);
		registry = PyroTokenRegistry(pyroTokenRegistry);
	}

	function open(address baseToken,uint value) external {
		lachesis.cut(baseToken);
		require (ERC20Like(registry.baseTokenMapping(baseToken)).totalSupply()>0,"bellow cannot be opened before pyrotokens minted");
		require(ERC20Like(baseToken).transferFrom(msg.sender,address(this),value),"Transfer from holder failed");
	}

	function blast(address pyroToken, uint value) external {
		lachesis.cut(registry.pyroTokenMapping(pyroToken));
		require(ERC20Like(pyroToken).transferFrom(msg.sender,address(this),value),"Transfer from holder failed");
		uint redeemRate = getRedeemRate(pyroToken);
		uint valueBurnt = PyroTokenLike(pyroToken).burn(value);
		require(PyroTokenLike(pyroToken).bellows() == address(this),"pyroToken reserve mismatch");
		uint baseTokenPayable = valueBurnt.mul(redeemRate).div(10000);
		address baseTokenAddress = registry.pyroTokenMapping(pyroToken);
		require(ERC20Like(baseTokenAddress).transfer(msg.sender,baseTokenPayable),"unable to pay base token from reserve");
	}

	function getRedeemRate(address pyroToken) public view returns (uint) {//pyroPerMyriadToken
		uint pyroTotalSupply = ERC20Like(pyroToken).totalSupply();
		uint baseBalance = ERC20Like(registry.pyroTokenMapping(pyroToken)).balanceOf(address(this));

		if(pyroTotalSupply == 0)
			return 100;

		return baseBalance
		.mul(10000) //scale by a myriad
		.div(pyroTotalSupply);
	}
}
