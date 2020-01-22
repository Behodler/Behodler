pragma solidity ^0.6.1;
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
/*
	Chronos is an oracle that records the trades of Behodler over time.
	While one would think that logging would suffice, this isn't accessible to contracts.
	Chronos keeps a moving average of the last 10, 100 and 1000 trades for a token pair.
	This provides attack resistant stability for anyone wishing to use it as an oracle.
	Trading pairs can be held as mapping(address=>mapping(address=uint)). If a pair of [X][Y] has a non zero value and a [Y][X] trade comes in, then it is
	just inverted and added to the [X][Y] running average.
 */


contract RingAverage{
	uint[] data;
	uint public total;
	uint public first;
	uint public last;
	uint length;

	constructor (uint l) public {
		length = l;
	}

	function push(uint value) external {
		total += value;

		if(data.length < length) {
			data.push(value);
		}
		else{
			total -= data[first];
			first = (first + 1) % length;
			last = (last + 1) % length;
			data[last] = value;
		}
	}

	function calculatedAverage() external view returns (uint) {
		return total/data.length;
	}
}


contract Chronos is Secondary {
	address behodlerAddress;
	using SafeMath for uint;
	mapping (address => bool) initialized;
	mapping (address => RingAverage[]) public stampData; // tokens per billion scx
	uint BILLION = 10**9;

	function seed (address beh) external {
		behodlerAddress = beh;
	}

	function stamp(address tokenAddress, uint scxValue, uint tokenValue) public onlyPrimary {
		require(msg.sender == behodlerAddress,"only Behodler can invoke this function");
		uint gigaValue = tokenValue*BILLION;
		if(tokenValue*BILLION<tokenValue)
			return;
		uint average = gigaValue/scxValue;
		if(!initialized[tokenAddress]){
			stampData[tokenAddress].push(new RingAverage(10));
			stampData[tokenAddress].push(new RingAverage(100));
			stampData[tokenAddress].push(new RingAverage(1000));
			initialized[tokenAddress] = true;
		}

		stampData[tokenAddress][0].push(average);
		stampData[tokenAddress][1].push(average);
		stampData[tokenAddress][2].push(average);
	}
}