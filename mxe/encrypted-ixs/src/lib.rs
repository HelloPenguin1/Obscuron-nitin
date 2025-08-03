use arcis_imports::*;

#[encrypted]
mod circuits {
    use arcis_imports::*;

    pub struct BountyInput {
        effort: u8,
        quality: u8,
    }

    #[instruction]
    pub fn bounty(input_ctxt: Enc<Shared, BountyInput>) -> Enc<Shared, u64> {
        let input = input_ctxt.to_arcis();
        let amount = (input.effort as u64 * 1_000_000) + (input.quality as u64 * 500_000);
        input_ctxt.owner.from_arcis(amount)
    }
}
