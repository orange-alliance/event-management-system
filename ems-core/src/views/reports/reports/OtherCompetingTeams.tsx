import * as React from "react";
import ReportTemplate from "./ReportTemplate";
import DialogManager from "../../../managers/DialogManager";
import {Table} from "semantic-ui-react";
import {EMSProvider, EventConfiguration, HttpError, Team} from "@the-orange-alliance/lib-ems";

interface IProps {
  eventConfig?: EventConfiguration,
  onHTMLUpdate: (htmlStr: string) => void
}

interface IState {
  generated: boolean,
  teams: Team[]
}

class OtherCompetingTeams extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      generated: false,
      teams: []
    };
  }

  public componentDidMount() {
    EMSProvider.getTeams().then((teams: Team[]) => {
      this.setState({generated: true, teams});
    }).catch((error: HttpError) => {
      DialogManager.showErrorBox(error);
      this.setState({generated: true});
    });
  }

  // TODO - We already have game-specific rank tables... Use them?
  public render() {
    const {onHTMLUpdate} = this.props;
    const {generated, teams} = this.state;
    const teamsView = teams.map(team => {
      return (
        <Table.Row key={team.teamKey}>
          <Table.Cell>{team.teamKey}</Table.Cell>
          <Table.Cell>{team.teamNameShort}</Table.Cell>
          <Table.Cell>{team.teamNameLong}</Table.Cell>
          <Table.Cell>{team.robotName}</Table.Cell>
          <Table.Cell>{team.location}</Table.Cell>
          <Table.Cell>{team.country}</Table.Cell>
          <Table.Cell>{team.countryCode}</Table.Cell>
        </Table.Row>
      );
    });
    let view = (
      <Table celled={true} structured={true} textAlign="center">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Team ID</Table.HeaderCell>
            <Table.HeaderCell>Name (Short)</Table.HeaderCell>
            <Table.HeaderCell>Name (Long)</Table.HeaderCell>
            <Table.HeaderCell>Robot Name</Table.HeaderCell>
            <Table.HeaderCell>Location</Table.HeaderCell>
            <Table.HeaderCell>Country</Table.HeaderCell>
            <Table.HeaderCell>ISO 2 Code</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {teamsView}
        </Table.Body>
      </Table>
    );
    if (teams.length <= 0) {
      view = (<span>There are no teams to report.</span>);
    }
    return (
      <ReportTemplate
        generated={generated}
        name={"Competing Teams"}
        updateHTML={onHTMLUpdate}
        children={view}
      />
    );
  }
}

export default OtherCompetingTeams;