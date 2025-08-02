
use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;


const COMP_DEF_OFFSET_COMPUTE_BOUNTY: u32 = comp_def_offset("compute_bounty");

declare_id!("REPLACE_WITH_YOUR_PROGRAM_ID");

#[arcium_program]
pub mod github_bounty {
    use super::*;

    pub fn init_compute_bounty(ctx: Context<InitComputeBountyCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }

    pub fn compute_bounty(
        ctx: Context<ComputeBounty>,
        computation_offset: u64,
        ciphertext_effort: [u8; 32],
        ciphertext_quality: [u8; 32],
        ciphertext_length: [u8; 32],
        pub_key: [u8; 32],
        nonce: u128,
    ) -> Result<()> {
        let args = vec![
            Argument::EncryptedU8(ciphertext_effort),
            Argument::EncryptedU8(ciphertext_quality),
            Argument::EncryptedU8(ciphertext_length),
            Argument::ArcisPubkey(pub_key),
            Argument::PlaintextU128(nonce),
        ];
        queue_computation(ctx.accounts, computation_offset, args, vec![], None)?;
        Ok(())
    }

    #[arcium_callback(encrypted_ix = "compute_bounty")]
    pub fn bounty_callback(ctx: Context<BountyCallback>, output: ComputationOutputs<BountyOutput>) -> Result<()> {
        let o = match output {
            ComputationOutputs::Success(BountyOutput { field_0 }) => field_0,
            _ => return Err(ErrorCode::AbortedComputation.into()),
        };
        emit!(BountyEvent {
            bounty: o.ciphertexts[0],
            nonce: o.nonce.to_le_bytes(),
        });
        Ok(())
    }
}
