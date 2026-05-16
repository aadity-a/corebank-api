package com.bank.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransactionDto {
    private String accountNumber;
    private BigDecimal amount;
    private String targetAccountNumber; // Only used for transfers
    private String description;
}
