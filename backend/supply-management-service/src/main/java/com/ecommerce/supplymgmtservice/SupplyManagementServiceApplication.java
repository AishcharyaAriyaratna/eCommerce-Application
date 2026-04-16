package com.ecommerce.supplymgmtservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan("com.ecommerce.supplymgmtservice")
public class SupplyManagementServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(SupplyManagementServiceApplication.class, args);
    }
}
