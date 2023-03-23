package at.duk.utils

import java.security.Principal

data class UserSession(
    val id: String,
    val content: String,
    val firstname: String,
    val lastname: String,
    val user: String,
    val roles: List<String>
): Principal {
    override fun getName(): String {
        TODO("Not yet implemented")
    }
}