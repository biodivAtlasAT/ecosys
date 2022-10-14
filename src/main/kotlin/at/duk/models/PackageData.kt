package at.duk.models

import kotlinx.serialization.Serializable

@Serializable
data class PackageData(val id: Int, val name: String, val default: Boolean)
