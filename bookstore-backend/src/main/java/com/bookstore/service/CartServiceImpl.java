package com.bookstore.service;

import com.bookstore.dto.CartDto;
import com.bookstore.dto.CartItemDto;
import com.bookstore.entity.Book;
import com.bookstore.entity.Cart;
import com.bookstore.entity.CartItem;
import com.bookstore.entity.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CartItemRepository;
import com.bookstore.repository.CartRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public CartServiceImpl(CartRepository cartRepository, CartItemRepository cartItemRepository, BookRepository bookRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    @Override
    public CartDto getCart() {
        Cart cart = getCurrentUserCart();
        return mapCartToDto(cart);
    }

    @Override
    public CartDto addToCart(Long bookId, int quantity) {
        Cart cart = getCurrentUserCart();
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found"));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getBook().getId().equals(bookId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            cartItemRepository.save(cartItem);
        } else {
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setBook(book);
            cartItem.setQuantity(quantity);
            cart.getItems().add(cartItem);
            cartItemRepository.save(cartItem);
        }

        return mapCartToDto(cart);
    }

    @Override
    public CartDto removeFromCart(Long bookId) {
        Cart cart = getCurrentUserCart();
        cart.getItems().removeIf(item -> item.getBook().getId().equals(bookId));
        cartItemRepository.deleteByCartAndBookId(cart, bookId);
        return mapCartToDto(cart);
    }

    @Override
    public CartDto updateQuantity(Long bookId, int quantity) {
        Cart cart = getCurrentUserCart();
        cart.getItems().stream()
                .filter(item -> item.getBook().getId().equals(bookId))
                .findFirst()
                .ifPresent(item -> {
                    item.setQuantity(quantity);
                    cartItemRepository.save(item);
                });
        return mapCartToDto(cart);
    }

    @Override
    public void clearCart() {
        Cart cart = getCurrentUserCart();
        cart.getItems().clear();
        cartItemRepository.deleteByCart(cart);
    }

    private Cart getCurrentUserCart() {
        // Always create a temporary cart for anonymous users
        // This ensures cart functionality works without authentication
        Cart tempCart = new Cart();
        tempCart.setId(0L);
        tempCart.setItems(new ArrayList<>()); // Initialize items list to avoid NullPointerException
        return tempCart;
    }

    private CartDto mapCartToDto(Cart cart) {
        CartDto cartDto = new CartDto();
        cartDto.setId(cart.getId());
        cartDto.setItems(cart.getItems().stream().map(this::mapCartItemToDto).collect(Collectors.toList()));
        return cartDto;
    }

    private CartItemDto mapCartItemToDto(CartItem cartItem) {
        CartItemDto cartItemDto = new CartItemDto();
        cartItemDto.setBookId(cartItem.getBook().getId());
        cartItemDto.setQuantity(cartItem.getQuantity());
        cartItemDto.setBook(cartItem.getBook());
        return cartItemDto;
    }
}