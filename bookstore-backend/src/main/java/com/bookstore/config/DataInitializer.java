package com.bookstore.config;

import com.bookstore.entity.Book;
import com.bookstore.entity.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 初始化图书数据
        if (bookRepository.count() == 0) {
            initializeBooks();
        }
        
        // 初始化管理员用户
        if (userRepository.findByUsername("admin").isEmpty()) {
            initializeAdmin();
        }
    }

    private void initializeBooks() {
        List<Book> books = Arrays.asList(
            createBook("Java核心技术", "Cay S. Horstmann", new BigDecimal("89.00"), 50, 
                "Java编程经典教程，深入浅出讲解Java核心概念和高级特性。", 
                "https://img3.doubanio.com/view/subject_l/public/s29988481.jpg"),
                
            createBook("Spring Boot实战", "Craig Walls", new BigDecimal("79.00"), 30, 
                "Spring Boot开发实战指南，快速构建企业级应用。", 
                "https://img9.doubanio.com/view/subject_l/public/s28357056.jpg"),
                
            createBook("算法导论", "Thomas H. Cormen", new BigDecimal("128.00"), 25, 
                "计算机科学领域的经典教材，全面介绍算法设计与分析。", 
                "https://img1.doubanio.com/view/subject_l/public/s3235973.jpg"),
                
            createBook("深入理解计算机系统", "Randal E. Bryant", new BigDecimal("139.00"), 20, 
                "从程序员的角度深入理解计算机系统的工作原理。", 
                "https://img3.doubanio.com/view/subject_l/public/s29195878.jpg"),
                
            createBook("设计模式", "Erich Gamma", new BigDecimal("69.00"), 40, 
                "面向对象设计的经典之作，23种设计模式详解。", 
                "https://img1.doubanio.com/view/subject_l/public/s1074361.jpg"),
                
            createBook("JavaScript高级程序设计", "Nicholas C. Zakas", new BigDecimal("99.00"), 35, 
                "JavaScript开发者必读经典，全面深入的JavaScript指南。", 
                "https://img1.doubanio.com/view/subject_l/public/s8958650.jpg"),
                
            createBook("Python编程：从入门到实践", "Eric Matthes", new BigDecimal("89.00"), 45, 
                "Python编程入门经典教程，理论与实践完美结合。", 
                "https://img3.doubanio.com/view/subject_l/public/s28659699.jpg"),
                
            createBook("数据库系统概念", "Abraham Silberschatz", new BigDecimal("119.00"), 15, 
                "数据库领域的权威教材，系统全面地介绍数据库理论与实践。", 
                "https://img9.doubanio.com/view/subject_l/public/s29408971.jpg"),
                
            createBook("计算机网络", "Andrew S. Tanenbaum", new BigDecimal("89.00"), 28, 
                "计算机网络经典教材，深入浅出讲解网络原理与协议。", 
                "https://img3.doubanio.com/view/subject_l/public/s29342249.jpg"),
                
            createBook("操作系统概念", "Abraham Silberschatz", new BigDecimal("109.00"), 22, 
                "操作系统领域的经典教材，全面介绍现代操作系统。", 
                "https://img1.doubanio.com/view/subject_l/public/s29408882.jpg"),
                
            createBook("机器学习", "周志华", new BigDecimal("88.00"), 30, 
                "机器学习领域的中文经典教材，系统介绍机器学习理论与方法。", 
                "https://img3.doubanio.com/view/subject_l/public/s28382295.jpg"),
                
            createBook("深度学习", "Ian Goodfellow", new BigDecimal("168.00"), 18, 
                "深度学习领域的权威教材，全面介绍深度学习理论与实践。", 
                "https://img1.doubanio.com/view/subject_l/public/s29370067.jpg")
        );
        
        bookRepository.saveAll(books);
        System.out.println("初始化了 " + books.size() + " 本图书");
    }
    
    private Book createBook(String title, String author, BigDecimal price, Integer stock, String description, String coverUrl) {
        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setPrice(price);
        book.setStock(stock);
        book.setDescription(description);
        book.setCoverUrl(coverUrl);
        return book;
    }
    
    private void initializeAdmin() {
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setEmail("admin@bookstore.com");
        admin.setRole(User.Role.ADMIN);
        userRepository.save(admin);
        System.out.println("初始化管理员账户: admin/admin123");
    }
}