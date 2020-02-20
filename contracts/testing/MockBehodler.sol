pragma solidity  0.6;
import "../contractFacades/KharonLike.sol";

contract MockBehodler
{
    KharonLike kharon;

    function seed (address k) external {
        kharon = KharonLike(k);
    }

    function demandPaymentInvoker(address token, uint value, address buyer) external {
        kharon.demandPayment(token,value,buyer);
    }

    function tokenScarcityObligations(address token) external pure returns (uint) {
        require(token!=address(0),"token scarcity obligation requires non zero token address");
        return 10000;
    }

}