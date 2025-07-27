package com.example.demo.service;

import com.example.demo.model.Doctor;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findByUserContactInfo(String contactInfo){return userRepository.findByContactInfo(contactInfo);}

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public List<User> findUsersByRole(Role role) {
        return userRepository.findAllByRole(role);
    }
   // @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

  //  @Override
    public boolean existsById(Long id) {
        return userRepository.existsById(id);
    }

  //  @Override
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
}
