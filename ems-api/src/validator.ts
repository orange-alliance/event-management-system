import {NextFunction, Request, Response} from "express";
import * as Errors from "./errors";

const postEvent = [
  "season_key",
  "region_key",
  "event_key",
  "event_name",
  "venue",
  "city",
  "country",
  "field_count"
];

const postTeam = [
  "team_key",
  "event_participant_key",
  "team_name_short",
  "city",
  "country",
  "country_code"
];

const postSchedule = [
  "schedule_item_key",
  "schedule_item_type",
  "schedule_Item_name",
  "schedule_day",
  "start_time",
  "duration",
  "is_match"
];

const postMatch = [
  "match_key",
  "match_detail_key",
  "match_name",
  "tournament_level",
  "scheduled_time",
  "field_number"
];

const postMatchParticipants = [
  "match_participant_key",
  "match_key",
  "team_key",
  "station"
];

const postRoutes = new Map<string, string[]>();

postRoutes.set("event", postEvent);
postRoutes.set("team", postTeam);
postRoutes.set("schedule", postSchedule);
postRoutes.set("match", postMatch);
postRoutes.set("match/participants", postMatchParticipants);

export function validate(req: Request, res: Response, next: NextFunction)  {
  const method = req.method.toString().toUpperCase();
  let routeMap: Map<string, string[]> = new Map<string, string[]>();
  let routeURL = req.baseUrl.replace("/api/", "");
  if (method === "GET" || method === "DELETE") {
      next();
      return;
  } else if (method === "POST") {
      routeMap = postRoutes;
  } else {
      next(Errors.METHOD_NOT_FOUND);
      return;
  }

  if (!routeMap.has(routeURL)) {
    next(Errors.ROUTE_NOT_DEFINED);
    return;
  }

  if (!req.body.records) {
    next(Errors.INVALID_BODY_JSON);
    return;
  }

  if (!(req.body.records instanceof Array)) {
    next(Errors.INVALID_BODY_JSON);
    return;
  }

  const requiredFields: string[] = routeMap.get(routeURL) as string[]; // Normally not safe, but we know it won't be undefined from our checks up above.
  for (const record of req.body.records) {
    for (let i = 0; i < requiredFields.length; i++) {
      if (typeof record[requiredFields[i]] === "undefined") {
        next(Errors.MISSING_BODY_INFORMATION(requiredFields[i]));
        return;
      }
    }
  }

  /* After all of our validation, continue on to the rest of the routing. */
  next();
}