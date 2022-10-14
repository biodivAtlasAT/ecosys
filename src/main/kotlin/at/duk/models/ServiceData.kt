package at.duk.models

import kotlinx.serialization.Serializable

@Serializable
data class ServiceData(val id: Int, val name: String, val category: CategoryData)
