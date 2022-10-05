package at.duk.services

import at.duk.tables.TableRasterTasks
import at.duk.tables.TableUploadedRasterData
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.javatime.CurrentDateTime
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File

class RasterUpload {
    companion object {
        private val charPool : List<Char> = ('a'..'z') + ('A'..'Z') + ('0'..'9')
        fun uploadIntoRasterTasks(fileDescription: String, fileName: String, cachePath: File) {
            /*2.	set values in table uploaded_raster_data
            3.	set values in table raster_tasks
            4.	Run "raster2pgsql" - Import Skript - create temporary table name, update raster_tasks
            temporary table "rd_126172617" is created*/

            lateinit var id: EntityID<Int>

            val tmpTableName = "table" + (1..12)
                .map { i -> kotlin.random.Random.nextInt(0, charPool.size) }
                .map(charPool::get)
                .joinToString("")

            transaction {
                addLogger(StdOutSqlLogger)
                /*val id = Packages.insertAndGetId {
                    it[name] = "Hugo2"
                    it[created] = CurrentDateTime
                }
                println("ID: ----------------- $id")*/

                id = TableUploadedRasterData.insertAndGetId {
                    it[filename] = fileName
                    it[name] = fileDescription
                    it[tmpTable] = tmpTableName
                }
            }
            // start script
            val scriptPid = 4711

            transaction {
                addLogger(StdOutSqlLogger)
                TableRasterTasks.insert {
                    it[pid] = 4711
                    it[start] = CurrentDateTime
                    it[uploadedRasterDataId] = id.value
                }
            }
        }
    }
}