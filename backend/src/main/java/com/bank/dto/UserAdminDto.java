package com.bank.dto;

import java.math.BigDecimal;

public class UserAdminDto {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String accountNumber;
    private BigDecimal balance;

    public UserAdminDto() {}

    public UserAdminDto(Long id, String name, String email, String role, String accountNumber, BigDecimal balance) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.accountNumber = accountNumber;
        this.balance = balance;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
}
