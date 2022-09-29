package at.duk.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.apiRouting() {
    route("/api") {
        get("/packages") {
            // dummy response
            val str = "{ 'error': { 'no': 0, 'msg': '' }, 'packages': [{ 'id': 1, 'name': 'Daten für das Jahr 2021', 'default': true }, {'id': 2, 'name': 'Datenlieferung von ZAMG 2015', 'default': false } "
            call.respondText(str, ContentType.parse("application/json"), HttpStatusCode.OK)
        }

        get("/services") {
            var str = "{'error':{'no':1,'msg':'packageID not valid!'}}"
            if (call.request.queryParameters["packageID"] == "1") {
                str =
                    "{'error':{'no':0,'msg':''},'services':[{'id':0,'category':{'id':0,'name':'Kulturelle Ökosystemleistungen'},'name':'Sport, Spiel'},{'id':1,'category':{'id':0,'name':'Kulturelle Ökosystemleistungen'},'name':'Erholung'},{'id':2,'category':{'id':1,'name':'Versorgende Ökosystemleistungen'},'name':'Nahrungsmittel, Ernten, Sammeln'},{'id':3,'category':{'id':1,'name':'Versorgende Ökosystemleistungen'},'name':'Trinkwasser'},{'id':4,'category':{'id':2,'name':'Regulierende Ökosystemleistungen'},'name':'Wasserrückhalt'},{'id':5,'category':{'id':2,'name':'Regulierende Ökosystemleistungen'},'name':'Bestäubungspotenzial'},{'id':6,'category':{'id':2,'name':'Regulierende Ökosystemleistungen'},'name':'Beschattung'}]}"
            }
            call.respondText(str, ContentType.parse("application/json"), HttpStatusCode.OK)
        }

        post("/rasterData") {
            var str = "{'error':{'no':2,'msg':'Parameters not valid!'}}"
            val packageID = call.request.queryParameters["packageID"]
            val services = call.request.queryParameters["services"]?.replace("[","")?. replace("]","")?.split(",")?.toList()
            val coords = call.request.queryParameters["coords"]?.replace("[","")?. replace("]","")?.split(",")?.toList()
            val coordsList: MutableList<Pair<String, String>> = emptyList<Pair<String, String>>().toMutableList()
            coords?.forEach {
                val lng_lat = it.replace("(","").replace(")","").split("/")
                if (lng_lat.size == 2)
                    coordsList.add(Pair(lng_lat[0], lng_lat[1]))
            }
            if (packageID != null && coordsList.isNotEmpty() && services != null) {
                str = "{'error': {'no': 0,'msg': ''},'data': [{'id': 1, 'vals': [{'val': '13.234','quantil': '2'}, {'val': '19.8','quantil': '4'}],'svg':'./svg/sport.svg','dim': 'km'},{'id': 4,'vals': [{'val': '43.234','quantil': '3'},{'val': '49.8','quantil': '4'}],'svg': './svg/wasser.svg','dim': 'm3'},{'id': 5,'vals': [{'val': '53.234','quantil': '0'},{'val': '59.8','quantil': '1'}],'svg': './svg/nahrung.svg','dim': ''}]}"
            }
            call.respondText(str, ContentType.parse("application/json"), HttpStatusCode.OK)
        }
    }
}

