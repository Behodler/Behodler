pragma solidity ^0.6.1;

abstract contract ERC20Like {
    function balanceOf(address account) external virtual view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        virtual
        returns (bool);
}

contract FeeSplitter {
    address public dgvc;
    address public founder;

    uint256 splitChangeProposalCount = 0;
    uint256 splitChangeProposal;
    uint256 public split; //% between 0 and 100 where 0 is all to founder and 100 is all to dgvc

    receive() external payable {
        revert();
    }

    fallback() external payable {
              revert();
    }

    modifier onlyBeneficiary() {
        require(
            (msg.sender == dgvc && dgvc != address(0)) || msg.sender == founder,
            "must be listed beneficiary"
        );
        _;
    }

    modifier onlyFounder() {
        require(msg.sender == founder, "must be founder");
        _;
    }

    constructor(address degenWallet) public {
        founder = msg.sender;
        dgvc = degenWallet;
        split = 50;
    }

        //multisig voting on new split
    function proposeNewSplit(uint256 newSplit) public onlyBeneficiary {
        require(newSplit<=100, '% expressed as value between 0 and 100');
        if (splitChangeProposalCount == 0) {
            splitChangeProposal = newSplit;
            splitChangeProposalCount++;
        } else if (splitChangeProposalCount == 1) {
            if (newSplit == splitChangeProposal) {
                split = newSplit;
            }
            splitChangeProposalCount = 0;
        }
    }

    function updateFounder(address f) public onlyFounder {
        founder = f;
        emit founderChanged(f);
    }

    function updateDGVC(address d) public onlyBeneficiary {
        dgvc = d;
        emit dgvcChanged(d);
    }

    function withdraw(address token) public onlyBeneficiary {
        uint256 balance = ERC20Like(token).balanceOf(address(this));
        if (balance > 0) {
            uint256 founderHaul = (balance * (100 - split)) / 100;
            uint256 dgvcHaul = (balance * split) / 100;
            require(founderHaul + dgvcHaul <= balance, "overflow in withdraw");
            ERC20Like(token).transfer(founder, founderHaul);
            ERC20Like(token).transfer(dgvc, dgvcHaul);
        }
    }

    event founderChanged(address newFounder);

    event dgvcChanged(address newDGVC);
}
