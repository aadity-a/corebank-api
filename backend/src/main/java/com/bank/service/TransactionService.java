package com.bank.service;

import com.bank.dto.TransactionDto;
import com.bank.entity.Account;
import com.bank.entity.Transaction;
import com.bank.entity.TransactionType;
import com.bank.repository.AccountRepository;
import com.bank.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public TransactionService(AccountRepository accountRepository, TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public String deposit(TransactionDto transactionDto, String userEmail) {
        Account account = accountRepository.findByAccountNumber(transactionDto.getAccountNumber())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized access to account");
        }

        account.setBalance(account.getBalance().add(transactionDto.getAmount()));
        accountRepository.save(account);

        saveTransaction(account, TransactionType.DEPOSIT, transactionDto);
        return "Deposit successful";
    }

    @Transactional
    public String withdraw(TransactionDto transactionDto, String userEmail) {
        Account account = accountRepository.findByAccountNumber(transactionDto.getAccountNumber())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized access to account");
        }

        if (account.getBalance().compareTo(transactionDto.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        account.setBalance(account.getBalance().subtract(transactionDto.getAmount()));
        accountRepository.save(account);

        saveTransaction(account, TransactionType.WITHDRAW, transactionDto);
        return "Withdrawal successful";
    }

    @Transactional
    public String transfer(TransactionDto transactionDto, String userEmail) {
        Account sourceAccount = accountRepository.findByAccountNumber(transactionDto.getAccountNumber())
                .orElseThrow(() -> new RuntimeException("Source account not found"));

        if (!sourceAccount.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized access to source account");
        }

        Account targetAccount = accountRepository.findByAccountNumber(transactionDto.getTargetAccountNumber())
                .orElseThrow(() -> new RuntimeException("Target account not found"));

        if (sourceAccount.getBalance().compareTo(transactionDto.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        // Deduct from source
        sourceAccount.setBalance(sourceAccount.getBalance().subtract(transactionDto.getAmount()));
        accountRepository.save(sourceAccount);

        // Add to target
        targetAccount.setBalance(targetAccount.getBalance().add(transactionDto.getAmount()));
        accountRepository.save(targetAccount);

        // Save transaction record for source account (WITHDRAW)
        saveTransaction(sourceAccount, TransactionType.TRANSFER, transactionDto);
        
        // Optionally save a record for target account (DEPOSIT)
        Transaction targetTransaction = new Transaction();
        targetTransaction.setAccount(targetAccount);
        targetTransaction.setAmount(transactionDto.getAmount());
        targetTransaction.setTransactionType(TransactionType.DEPOSIT);
        targetTransaction.setTransactionDate(LocalDateTime.now());
        targetTransaction.setDescription("Transfer from " + sourceAccount.getAccountNumber());
        transactionRepository.save(targetTransaction);

        return "Transfer successful";
    }

    public List<Transaction> getTransactionHistory(String accountNumber, String userEmail) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        if (!account.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized access to account");
        }
        return transactionRepository.findByAccountIdOrderByTransactionDateDesc(account.getId());
    }

    private void saveTransaction(Account account, TransactionType type, TransactionDto dto) {
        Transaction transaction = new Transaction();
        transaction.setAccount(account);
        transaction.setAmount(dto.getAmount());
        transaction.setTransactionType(type);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setDescription(dto.getDescription());
        transaction.setTargetAccountNumber(dto.getTargetAccountNumber());
        transactionRepository.save(transaction);
    }
}
