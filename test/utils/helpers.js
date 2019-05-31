const Chance = require('chance');

class AlertingFakes {
  constructor(seed = 'seed') {
    this.chance = new Chance(seed);

    this.randomMailDestination = this.randomMailDestination.bind(this);
    this.randomCustomWebhookDestination = this.randomCustomWebhookDestination.bind(this);
    this.randomChimeDestination = this.randomChimeDestination.bind(this);
    this.randomSlackDestination = this.randomSlackDestination.bind(this);
    this.randomDestination = this.randomDestination.bind(this);
    this.randomAction = this.randomAction.bind(this);
    this.randomTrigger = this.randomTrigger.bind(this);
    this.randomCronSchedule = this.randomCronSchedule.bind(this);
    this.randomPeriodSchedule = this.randomPeriodSchedule.bind(this);
    this.randomSchedule = this.randomSchedule.bind(this);
    this.randomIndices = this.randomIndices.bind(this);
    this.randomQuery = this.randomQuery.bind(this);
    this.randomSearchInput = this.randomSearchInput.bind(this);
    this.randomInputs = this.randomInputs.bind(this);
    this.randomMonitorEnabled = this.randomMonitorEnabled.bind(this);
    this.randomMonitor = this.randomMonitor.bind(this);
  }

  randomMailDestination() {
    return {
      type: 'mail',
      mail: {
        host: `${this.chance.word}`,
        port: '25',
        auth: false,
        starttls: false,
        username: this.chance.word(),
        password: this.chance.word(),
        from: `${this.chance.word()}@${this.chance.word()}.test`,
        recipients: `${this.chance.word()}@${this.chance.word()}.test`,
      },
    };
  }

  randomCustomWebhookDestination() {
    return {
      type: 'custom_webhook',
      custom_webhook: {
        url: `https://www.${this.chance.word}.com/${this.chance.guid}`,
        scheme: '',
        host: '',
        port: '',
        path: '',
        query_params: {},
        header_params: {},
        username: this.chance.word(),
        password: this.chance.word(),
      },
    };
  }

  randomChimeDestination() {
    return {
      type: 'chime',
      chime: {
        url: `https://www.${this.chance.word}.com/${this.chance.guid}`,
      },
    };
  }

  randomSlackDestination() {
    return {
      type: 'slack',
      slack: {
        url: `https://www.${this.chance.word}.com/${this.chance.guid}`,
      },
    };
  }

  randomDestination() {
    const destination = this.chance.pickone([
      this.randomSlackDestination,
      this.randomChimeDestination,
      this.randomCustomWebhookDestination,
      this.randomMailDestination,
    ])();
    return {
      name: this.chance.word(),
      ...destination,
      last_update_time: this.chance.timestamp(),
    };
  }

  randomAction() {
    return {
      name: this.chance.word(),
      destination_id: this.chance.guid().slice(0, 20),
      message_template: {
        lang: 'mustache',
        source: this.chance.paragraph(),
      },
      subject_template: {
        lang: 'mustache',
        source: this.chance.sentence({ words: 5 }),
      },
    };
  }

  randomTrigger() {
    return {
      id: this.chance.guid().slice(0, 20),
      name: this.chance.word(),
      severity: this.chance.string({ length: 1, pool: '12345' }),
      condition: {
        script: {
          lang: 'painless',
          source: `return ${this.chance.bool()}`,
        },
      },
      actions: new Array(this.chance.natural({ max: 10 }))
        .fill(null)
        .map(() => this.randomAction()),
    };
  }

  randomCronSchedule() {
    const timezones = ['America/Los_Angeles', 'America/New_York'];
    return {
      period: {
        expression: `0 ${this.chance.natural({ max: 12 })} * * *`,
        timezone: this.chance.pickone(timezones),
      },
    };
  }

  randomPeriodSchedule() {
    const units = ['MINUTES', 'HOURS', 'DAYS'];
    return {
      period: { interval: this.chance.natural({ max: 50 }), unit: this.chance.pickone(units) },
    };
  }

  randomSchedule() {
    const schedules = [this.randomPeriodSchedule, this.randomCronSchedule];
    return this.chance.pickone(schedules)();
  }

  randomIndices() {
    return new Array(this.chance.natural({ max: 5 })).fill(null).map(() => this.chance.word());
  }

  randomQuery() {
    return { size: 0, query: { match_all: {} } };
  }

  randomSearchInput() {
    return {
      search: {
        indices: this.randomIndices(),
        query: this.randomQuery(),
      },
    };
  }

  randomInputs() {
    return [this.randomSearchInput()];
  }

  randomMonitorEnabled() {
    const enabled = this.chance.bool();
    return { enabled, enabled_time: enabled ? this.chance.timestamp() : null };
  }

  randomMonitor() {
    return {
      name: this.chance.word(),
      type: 'monitor',
      ...this.randomMonitorEnabled,
      last_update_time: this.chance.timestamp(),
      schedule: this.randomSchedule(),
      inputs: this.randomInputs(),
      triggers: new Array(this.chance.natural({ max: 10 }))
        .fill(null)
        .map(() => this.randomTrigger()),
    };
  }
}

module.exports = AlertingFakes;
