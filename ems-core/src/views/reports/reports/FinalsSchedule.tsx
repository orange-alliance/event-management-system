import * as React from "react";
import ReportTemplate from "./ReportTemplate";
import {IApplicationState} from "../../../stores";
import {connect} from "react-redux";
import {Table} from "semantic-ui-react";
import {EventConfiguration, Match, Team} from "@the-orange-alliance/lib-ems";

interface IProps {
  teamList?: Team[],
  playoffsMatches?: Match[],
  eventConfig?: EventConfiguration,
  onHTMLUpdate: (htmlStr: string) => void
}

interface IState {
  generated: boolean
}

class FinalsSchedule extends React.Component<IProps, IState> {
  private _teamMap: Map<number, Team>;

  constructor(props: IProps) {
    super(props);
    this.state = {
      generated: false
    };
    this._teamMap = new Map<number, Team>();
  }

  public componentDidMount() {
    const {playoffsMatches, teamList} = this.props;
    if (playoffsMatches.length <= 0 || teamList.length <= 0) {
      this.setState({generated: true});
    } else {
      for (const team of teamList) {
        this._teamMap.set(team.teamKey, team);
      }
      setTimeout(() => {
        this.setState({generated: true});
      }, 250);
    }
  }

  public render() {
    const {onHTMLUpdate, eventConfig, playoffsMatches} = this.props;
    const {generated} = this.state;
    const matches = playoffsMatches.filter(match => match.tournamentLevel === Match.FINALS_LEVEL).map(match => {
      const participants = match.participants.map(participant => {
        if (typeof this._teamMap.get(participant.teamKey) !== "undefined") {
          return (
            <Table.Cell key={participant.matchParticipantKey}>
              {this._teamMap.get(participant.teamKey).getFromIdentifier(eventConfig.teamIdentifier)}{participant.surrogate ? "*" : ""}
            </Table.Cell>
          );
        } else {
          return (
            <Table.Cell key={participant.matchParticipantKey}>
              {participant.teamKey}{participant.surrogate ? "*" : ""}
            </Table.Cell>
          );
        }
      });
      return (
        <Table.Row key={match.matchKey}>
          <Table.Cell>{match.matchName}</Table.Cell>
          <Table.Cell>{match.fieldNumber}</Table.Cell>
          <Table.Cell>{match.scheduledStartTime.format("dddd h:mm a")}</Table.Cell>
          {participants}
        </Table.Row>
      );
    });
    const allianceHeaders = [];
    for (let i = 0; i < eventConfig.teamsPerAlliance; i++) {
      allianceHeaders.push(
        <Table.HeaderCell key={i}>Team {i + 1}</Table.HeaderCell>
      );
    }
    let view = (
      <Table celled={true} structured={true} textAlign="center">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell rowSpan={2}>Match</Table.HeaderCell>
            <Table.HeaderCell rowSpan={2}>Field</Table.HeaderCell>
            <Table.HeaderCell rowSpan={2}>Time</Table.HeaderCell>
            <Table.HeaderCell colSpan={eventConfig.teamsPerAlliance}>Red Alliance</Table.HeaderCell>
            <Table.HeaderCell colSpan={eventConfig.teamsPerAlliance}>Blue Alliance</Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            {allianceHeaders}
            {allianceHeaders}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {matches}
        </Table.Body>
      </Table>
    );
    if (playoffsMatches.length <= 0) {
      view = (<span>There are no finals matches to report.</span>);
    }
    return (
      <ReportTemplate
        children={view}
        generated={generated}
        name={"Finals Schedule"}
        updateHTML={onHTMLUpdate}
      />
    );
  }
}

export function mapStateToProps({configState, internalState}: IApplicationState) {
  return {
    teamList: internalState.teamList,
    playoffsMatches: internalState.playoffsMatches,
    eventConfig: configState.eventConfiguration
  };
}

export default connect(mapStateToProps)(FinalsSchedule);