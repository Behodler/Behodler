pragma solidity  0.6;
import "../contractFacades/KharonLike.sol";
import "../contractFacades/ERC20Like.sol";
import "../contractFacades/ScarcityLike.sol";

contract MockBehodler
{
    KharonLike kharon;
    address kharonAddress;
    address scarcityAddress;
    uint public latestDemandPaymentResult;
    function seed (address k, address scarcity) external {
        kharon = KharonLike(k);
        kharonAddress = k;
        scarcityAddress = scarcity;
    }

    function demandPaymentInvoker(address token, uint value, address buyer) external {
        ERC20Like(token).transferFrom(buyer,address(this),value);
        ERC20Like(token).approve(kharonAddress,value);
        latestDemandPaymentResult = kharon.demandPayment(token,value,buyer);
    }

    function tokenScarcityObligations(address token) external pure returns (uint) {
        require(token!=address(0),"token scarcity obligation requires non zero token address");
        return 10000;
    }

    function mintScarcity() public {
        ScarcityLike(scarcityAddress).mint(msg.sender,10000);
    }
}