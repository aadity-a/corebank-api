package com.bank.dto;

import com.bank.entity.Role;
import lombok.Data;

@Data
public class RegisterDto {
    private String name;
    private String email;
    private String password;
    private Role role; // Added role to simplify admin/employee creation
}
