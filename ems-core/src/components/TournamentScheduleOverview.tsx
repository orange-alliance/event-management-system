import * as React from "react";
import {Event, EventConfiguration, TournamentRound} from "@the-orange-alliance/lib-ems";
import {IApplicationState} from "../stores";
import {connect} from "react-redux";
import {Tab} from "semantic-ui-react";
import SetupScheduleOverview from "./SetupScheduleOverview";

interface IProps {
  event?: Event;
  eventConfig?: EventConfiguration;
}

class TournamentScheduleOverview extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  public render() {
    const {event, eventConfig} = this.props;
    let activeTournament: TournamentRound;

    if (Array.isArray(eventConfig.tournament)) {
      const rounds = eventConfig.tournament.filter((r: TournamentRound) => r.id === eventConfig.activeTournamentID);
      if (rounds.length > 0) {
        activeTournament = rounds[0];
      }
    } else {
      if (eventConfig.tournament.id === eventConfig.activeTournamentID) {
        activeTournament = eventConfig.tournament;
      }
    }

    let view;

    if (typeof activeTournament === "undefined") {
      view = (
        <Tab.Pane>
          <div>
            <i>There is currently no active tournament level. Please go back to the tournament overview and make a tournament active.</i>
          </div>
        </Tab.Pane>
      );
    } else {
      switch (activeTournament.type) {
        case "rr":
          view = <SetupScheduleOverview eventKey={event.eventKey} tournamentId={activeTournament.id} type={"Round Robin"}/>;
          break;
        case "elims":
          view = <SetupScheduleOverview eventKey={event.eventKey} tournamentId={activeTournament.id} type={"Eliminations"}/>;
          break;
        case "ranking":
          view = <SetupScheduleOverview eventKey={event.eventKey} tournamentId={activeTournament.id} type={"Ranking"}/>;
          break;
      }
    }

    return (view);
  }
}

export function mapStateToProps({configState}: IApplicationState) {
  return {
    event: configState.event,
    eventConfig: configState.eventConfiguration
  };
}

export default connect(mapStateToProps)(TournamentScheduleOverview);