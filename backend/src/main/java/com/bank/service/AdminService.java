package com.bank.service;

import com.bank.dto.UserAdminDto;
import com.bank.entity.Account;
import com.bank.entity.Transaction;
import com.bank.entity.User;
import com.bank.repository.AccountRepository;
import com.bank.repository.TransactionRepository;
import com.bank.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public AdminService(UserRepository userRepository, AccountRepository accountRepository, TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<UserAdminDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Account> accounts = accountRepository.findAll();
        
        return users.stream().map(user -> {
            Account userAccount = accounts.stream()
                .filter(a -> a.getUser() != null && a.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElse(null);
                
            return new UserAdminDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                userAccount != null ? userAccount.getAccountNumber() : "N/A",
                userAccount != null ? userAccount.getBalance() : null
            );
        }).collect(Collectors.toList());
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
}
