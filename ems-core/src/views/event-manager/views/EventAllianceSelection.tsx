import * as React from "react";
import {Button, Card, Divider, DropdownItemProps, DropdownProps, Form, Grid, Table} from "semantic-ui-react";
import {getTheme} from "../../../AppTheme";
import {ApplicationActions, IApplicationState} from "../../../stores";
import {connect} from "react-redux";
import DialogManager from "../../../managers/DialogManager";
import {SyntheticEvent} from "react";
import {IDisableNavigation, ISetAllianceMembers} from "../../../stores/internal/types";
import {Dispatch} from "redux";
import {disableNavigation, setAllianceMembers} from "../../../stores/internal/actions";
import EventCreationManager from "../../../managers/EventCreationManager";
import {
  AllianceMember, EliminationMatchesFormat, EMSProvider, Event, EventConfiguration, HttpError, Ranking,
  SocketProvider
} from "@the-orange-alliance/lib-ems";

interface IProps {
  onComplete: () => void,
  eventConfig?: EventConfiguration,
  event?: Event,
  navigationDisabled?: boolean,
  setNavigationDisabled?: (disabled: boolean) => IDisableNavigation,
  setAllianceMembers?: (members: AllianceMember[]) => ISetAllianceMembers
}

interface IState {
  rankings: Ranking[],
  inputValues: number[],
  autoAddStack: number[],
}

class EventAllianceSelection extends React.Component<IProps, IState> {
  private _teamOptions: DropdownItemProps[];
  private _pickedTeams: number[];

  constructor(props: IProps) {
    super(props);
    const initialValues: number[] = [];
    const tournamentRound = Array.isArray(this.props.eventConfig.tournament) ? this.props.eventConfig.tournament[0] : this.props.eventConfig.tournament; // TODO - CHANGE
    const alliances = (tournamentRound.format as EliminationMatchesFormat).alliances;
    for (let i = 0; i < (alliances * tournamentRound.format.teamsPerAlliance); i++) {
      initialValues.push(0);
    }
    this._pickedTeams = [];
    this._teamOptions = [];
    this.state = {
      rankings: [],
      inputValues: initialValues,
      autoAddStack: []
    };
    this.autoRemoveTeam = this.autoRemoveTeam.bind(this);
    this.generateAlliances = this.generateAlliances.bind(this);
  }

  public componentDidMount() {
    EMSProvider.getRankingTeams().then((rankings: Ranking[]) => {
      if (rankings.length) {
        this._teamOptions = rankings.map(ranking => {
          return {key: ranking.teamKey, value: ranking.teamKey, text: `#${ranking.rank}. ${ranking.team.getFromIdentifier(this.props.eventConfig.teamIdentifier)}`};
        });
        this.setState({rankings});
      }
    }).catch((error: HttpError) => {
      DialogManager.showErrorBox(error);
    });
  }

  public render() {

    const {rankings, inputValues} = this.state;
    const {eventConfig, navigationDisabled} = this.props;
    let canGenerate: boolean = true;

    this._pickedTeams = [];
    for (const value of inputValues) {
      if (value <= 0) {
        canGenerate = false;
      } else {
        if (value > 0 && this._pickedTeams.indexOf(value) <= -1) {
          this._pickedTeams.push(value);
        } else {
          canGenerate = false;
        }
      }
    }

    const teamOptions = this._teamOptions;
    const alliances: any[] = [];
    const tournamentRound = Array.isArray(this.props.eventConfig.tournament) ? this.props.eventConfig.tournament[0] : this.props.eventConfig.tournament; // TODO - CHANGE
    const captains = (tournamentRound.format as EliminationMatchesFormat).alliances;
    for (let i = 0; i < captains; i++) {
      const alliancePicks: any[] = [];
      for (let j = 0; j < (tournamentRound.format.teamsPerAlliance - 1); j++) {
        const index = (j + 1) + (i * tournamentRound.format.teamsPerAlliance);
        alliancePicks.push(
          <Grid.Column key={"alliance-" + (i + 1) + "-pick-" + (j + 1)}>
            <Form.Dropdown fluid={true} search={true} selection={true} options={teamOptions} value={inputValues[index]} onChange={this.changeTeam.bind(this, index)} label={"Pick #" + (j + 1)}/>
          </Grid.Column>
        );
      }
      alliances.push(
        <Grid.Row key={"alliance-" + (i + 1)}>
          <Grid.Column><Form.Dropdown fluid={true} search={true} selection={true} options={teamOptions} value={inputValues[i * tournamentRound.format.teamsPerAlliance]} onChange={this.changeTeam.bind(this, i * tournamentRound.format.teamsPerAlliance)} label={"Alliance Captain #" + (i + 1)}/></Grid.Column>
          {alliancePicks}
        </Grid.Row>
      );
    }

    const availableRankings: any[] = [];
    for (const rank of rankings) {
      if (this._pickedTeams.indexOf(rank.teamKey) <= -1) {
        const displayName = typeof rank.team !== "undefined" ? rank.team.getFromIdentifier(eventConfig.teamIdentifier) : rank.teamKey;
        availableRankings.push(
          <Table.Row key={rank.teamKey} onClick={this.autoAddTeam.bind(this, rank.teamKey)}>
            <Table.Cell>{rank.rank}</Table.Cell>
            <Table.Cell>{displayName}</Table.Cell>
            <Table.Cell>{rank.played}</Table.Cell>
          </Table.Row>
        );
      }
    }

    return (
      <Card fluid={true} color={getTheme().secondary} className="step-view">
        <Card.Content className='card-header'>
          <Card.Header>Alliance Selections</Card.Header>
        </Card.Content>
        <Card.Content>
          <Grid columns={16}>
            <Grid.Row>
              <Grid.Column width={10}>
                <Form>
                  <Grid columns="equal">
                    {alliances}
                  </Grid>
                </Form>
              </Grid.Column>
              <Grid.Column width={6} className="step-view-inner-table">
                <Table color={getTheme().primary} selectable={true} attached={true} celled={true} textAlign="center">
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Rank</Table.HeaderCell>
                      <Table.HeaderCell>Team</Table.HeaderCell>
                      <Table.HeaderCell>Played</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {availableRankings}
                  </Table.Body>
                </Table>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Divider/>
          <div className="step-table-buttons">
            <div>
              <Button color={getTheme().primary} loading={navigationDisabled} disabled={!canGenerate || navigationDisabled} onClick={this.generateAlliances}>Save &amp; Publish</Button>
              <Button color={getTheme().primary} disabled={navigationDisabled} onClick={this.autoRemoveTeam}>Undo Action</Button>
            </div>
            <div>
              <Button color={getTheme().secondary} disabled={navigationDisabled} onClick={this.switchVideo.bind(this, 7)}>Show Available Teams</Button>
              <Button color={getTheme().secondary} disabled={navigationDisabled} onClick={this.switchVideo.bind(this, 8)}>Show Current Alliances</Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    );
  }

  private changeTeam(index: number, event: SyntheticEvent, props: DropdownProps) {
    this.state.inputValues[index] = props.value as number;
    this.sendAllianceUpdate();
    this.forceUpdate();
  }

  private autoAddTeam(teamKey: number) {
    for (let i = 0; i < this.state.inputValues.length; i++) {
      if (this.state.inputValues[i] <= 0) {
        this.state.inputValues[i] = teamKey;
        this.state.autoAddStack.push(i);
        this.sendAllianceUpdate();
        this.forceUpdate();
        break;
      }
    }
  }

  private autoRemoveTeam() {
    if (this.state.autoAddStack.length > 0) {
      const index = this.state.autoAddStack.pop();
      this.state.inputValues[index] = 0;
      this.sendAllianceUpdate();
      this.forceUpdate();
    }
  }

  private generateAlliances() {
    this.props.setNavigationDisabled(true);
    const members: AllianceMember[] = [];
    let allianceIndex = 0;
    const tournamentRound = Array.isArray(this.props.eventConfig.tournament) ? this.props.eventConfig.tournament[0] : this.props.eventConfig.tournament; // TODO - CHANGE
    for (let i = 0; i < this.state.inputValues.length; i++) {
      const member: AllianceMember = new AllianceMember();
      const memberIndex = i % tournamentRound.format.teamsPerAlliance === 0 ? 1 : (i % tournamentRound.format.teamsPerAlliance + 1);
      if (i % tournamentRound.format.teamsPerAlliance !== 0) {
        member.isCaptain = false;
      } else {
        member.isCaptain = true;
        allianceIndex++;
      }
      member.allianceKey = this.props.event.eventKey + "-A" + allianceIndex + "-M" + memberIndex;
      member.allianceRank = allianceIndex;
      member.allianceNameShort = allianceIndex.toString();
      member.teamKey = this.state.inputValues[i];
      members.push(member);
    }
    EventCreationManager.postAlliances(members).then(() => {
      this.props.setAllianceMembers(members);
      this.props.setNavigationDisabled(false);
      this.props.onComplete();
    }).catch((error: HttpError) => {
      this.props.setNavigationDisabled(false);
      DialogManager.showErrorBox(error);
    });
  }

  private switchVideo(id: number) {
    SocketProvider.send("request-video", id);
  }

  private sendAllianceUpdate() {
    SocketProvider.send("alliance-update", this.state.inputValues);
  }
}

export function mapStateToProps({configState, internalState}: IApplicationState) {
  return {
    eventConfig: configState.eventConfiguration,
    event: configState.event,
    navigationDisabled: internalState.navigationDisabled
  };
}

export function mapDispatchToProps(dispatch: Dispatch<ApplicationActions>) {
  return {
    setNavigationDisabled: (disabled: boolean) => dispatch(disableNavigation(disabled)),
    setAllianceMembers: (members: AllianceMember[]) => dispatch(setAllianceMembers(members))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EventAllianceSelection);