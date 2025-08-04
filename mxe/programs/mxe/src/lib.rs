use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;

const COMP_DEF_OFFSET_BOUNTY: u32 = comp_def_offset("bounty");

declare_id!("FzcGDfci4AketBSehtWsvZAoE9k4Kd3ZZNar9nKn3gj3");

#[arcium_program]
pub mod computebounty {
    use super::*;

    pub fn init_bounty_comp_def(ctx: Context<InitBountyCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, true, 0, None, None)?;
        Ok(())
    }
}
pub fn bounty(
    ctx: Context<Bounty>,
    computation_offset: u64,
    effort: [u8; 32],
    quality: [u8; 32],
    pub_key: [u8; 32],
    nonce: u128,
) -> Result<()> {
    let arg_pub_key = Argument::ArcisPubkey(pub_key);
        let arg_nonce = Argument::PlaintextU128(nonce);
        let arg_effort = Argument::EncryptedU8(effort);
        let arg_quality = Argument::EncryptedU8(quality);

        let args = vec![arg_pub_key, arg_nonce, arg_effort, arg_quality];
    queue_computation(ctx.accounts, computation_offset, args, vec![], None)?;
    Ok(())
}

#[arcium_callback(encrypted_ix = "bounty")]
pub fn bounty_callback(
    ctx: Context<BountyCallback>,
    output: ComputationOutputs<BountyOutput>,
) -> Result<()> {
    let o = match output {
        ComputationOutputs::Success(BountyOutput { field_0 }) => field_0,
        _ => return Err(ErrorCode::AbortedComputation.into()),
    };

    emit!(BountyEvent { result: o.ciphertexts[0], nonce: o.nonce.to_le_bytes() });

    Ok(())
}

#[queue_computation_accounts("bounty", payer)]
#[derive(Accounts)]
#[instruction(computation_offset: u64)]
pub struct Bounty<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Account<'info, MXEAccount>,
    #[account(
        mut,
        address = derive_mempool_pda!()
    )]
    /// CHECK: mempool_account, checked by the arcium program
    pub mempool_account: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_execpool_pda!()
    )]
    /// CHECK: executing_pool, checked by the arcium program
    pub executing_pool: UncheckedAccount<'info>,
    #[account(
        mut,
        address = derive_comp_pda!(computation_offset)
    )]
    /// CHECK: computation_account, checked by the arcium program.
    pub computation_account: UncheckedAccount<'info>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_BOUNTY)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(
        mut,
        address = derive_cluster_pda!(mxe_account)
    )]
    pub cluster_account: Account<'info, Cluster>,
    #[account(
        mut,
        address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS,
    )]
    pub pool_account: Account<'info, FeePool>,
    #[account(
        address = ARCIUM_CLOCK_ACCOUNT_ADDRESS,
    )]
    pub clock_account: Account<'info, ClockAccount>,
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
}

#[callback_accounts("bounty", payer)]
#[derive(Accounts)]
pub struct BountyCallback<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub arcium_program: Program<'info, Arcium>,
    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_BOUNTY)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK: instructions_sysvar, checked by the account constraint
    pub instructions_sysvar: AccountInfo<'info>,
}

#[init_computation_definition_accounts("bounty", payer)]
#[derive(Accounts)]
pub struct InitBountyCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, checked by arcium program.
    /// Can't check it here as it's not initialized yet.
    pub comp_def_account: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

/// Event emitted when amount calculated.
#[event]
pub struct BountyEvent {
    /// The computed bounty amount in ciphertext (32 bytes).
    pub result: [u8; 32],
    /// The nonce used for encryption.
    pub nonce: [u8; 16],
}

#[error_code]
pub enum ErrorCode {
    #[msg("The computation was aborted")]
    AbortedComputation,
    #[msg("The cluster is not set")]
    ClusterNotSet,
}
